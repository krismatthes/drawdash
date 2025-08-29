-- DrawDash Database Schema
-- This schema defines the database structure for the raffle/draw site

-- Users table for authentication and user management
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    is_verified BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false,
    points INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0.00,
    loyalty_tier VARCHAR(20) DEFAULT 'bronze',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User addresses for billing/shipping
CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'billing', 'shipping'
    line1 VARCHAR(255) NOT NULL,
    line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    postcode VARCHAR(20) NOT NULL,
    country VARCHAR(2) DEFAULT 'GB',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Raffles/draws table
CREATE TABLE raffles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(500),
    ticket_price DECIMAL(10,2) NOT NULL,
    total_tickets INTEGER NOT NULL,
    sold_tickets INTEGER DEFAULT 0,
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'upcoming', -- 'upcoming', 'active', 'ended', 'cancelled'
    winner_user_id UUID REFERENCES users(id),
    winner_ticket_number INTEGER,
    winner_drawn_at TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Raffle prizes
CREATE TABLE raffle_prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raffle_id UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    value DECIMAL(12,2) NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Raffle entries/tickets
CREATE TABLE raffle_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    raffle_id UUID NOT NULL REFERENCES raffles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_intent_id VARCHAR(255), -- Stripe payment intent ID
    payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    ticket_numbers INTEGER[] NOT NULL, -- Array of ticket numbers assigned
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT positive_quantity CHECK (quantity > 0),
    CONSTRAINT positive_amount CHECK (total_amount > 0)
);

-- Payment transactions
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    raffle_entry_id UUID REFERENCES raffle_entries(id),
    payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',
    status VARCHAR(20) NOT NULL, -- 'pending', 'succeeded', 'failed', 'cancelled', 'refunded'
    payment_method_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions for authentication
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email verification tokens
CREATE TABLE verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'email_verification', 'password_reset'
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System settings/configuration
CREATE TABLE system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit log for admin actions
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_raffles_status ON raffles(status);
CREATE INDEX idx_raffles_end_date ON raffles(end_date);
CREATE INDEX idx_raffle_entries_raffle_id ON raffle_entries(raffle_id);
CREATE INDEX idx_raffle_entries_user_id ON raffle_entries(user_id);
CREATE INDEX idx_raffle_entries_payment_status ON raffle_entries(payment_status);
CREATE INDEX idx_payments_payment_intent_id ON payments(payment_intent_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX idx_verification_tokens_user_id ON verification_tokens(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_raffles_updated_at BEFORE UPDATE ON raffles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically assign ticket numbers
CREATE OR REPLACE FUNCTION assign_ticket_numbers()
RETURNS TRIGGER AS $$
DECLARE
    next_ticket INTEGER;
    tickets INTEGER[];
    i INTEGER;
BEGIN
    -- Get the next available ticket number for this raffle
    SELECT COALESCE(MAX(unnest(ticket_numbers)), 0) + 1
    INTO next_ticket
    FROM raffle_entries
    WHERE raffle_id = NEW.raffle_id;
    
    -- If no tickets exist yet, start from 1
    IF next_ticket IS NULL THEN
        next_ticket := 1;
    END IF;
    
    -- Generate array of consecutive ticket numbers
    tickets := ARRAY[]::INTEGER[];
    FOR i IN 0..(NEW.quantity - 1) LOOP
        tickets := array_append(tickets, next_ticket + i);
    END LOOP;
    
    -- Assign the ticket numbers
    NEW.ticket_numbers := tickets;
    
    -- Update sold tickets count on raffle
    UPDATE raffles 
    SET sold_tickets = sold_tickets + NEW.quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.raffle_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to assign ticket numbers on insert
CREATE TRIGGER assign_ticket_numbers_trigger
    BEFORE INSERT ON raffle_entries
    FOR EACH ROW EXECUTE FUNCTION assign_ticket_numbers();

-- Insert some default system settings
-- Loyalty tiers definition table
CREATE TABLE loyalty_tiers (
    tier VARCHAR(20) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    min_spent DECIMAL(12,2) NOT NULL,
    points_multiplier DECIMAL(3,2) DEFAULT 1.00,
    benefits JSONB,
    color VARCHAR(7),
    icon VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Point transactions for tracking point history
CREATE TABLE point_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    raffle_entry_id UUID REFERENCES raffle_entries(id),
    type VARCHAR(20) NOT NULL, -- 'earned', 'redeemed', 'bonus', 'refunded'
    points INTEGER NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for loyalty system
CREATE INDEX idx_users_loyalty_tier ON users(loyalty_tier);
CREATE INDEX idx_users_points ON users(points);
CREATE INDEX idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX idx_point_transactions_type ON point_transactions(type);

-- Insert loyalty tiers
INSERT INTO loyalty_tiers (tier, name, min_spent, points_multiplier, benefits, color, icon) VALUES
('bronze', 'Bronze', 0.00, 1.00, '{"description": "Velkommen til DrawDash Rewards", "features": ["Grundlæggende pointoptjening", "Adgang til alle lodtrækninger", "Points indløsning"]}', '#CD7F32', '🥉'),
('silver', 'Silver', 500.00, 1.15, '{"description": "Forbedret pointoptjening og fordele", "features": ["15% bonus points", "Prioriteret kundeservice", "Månedlig gratis billet", "Fødselsdagsbonus"]}', '#C0C0C0', '🥈'),
('gold', 'Gold', 2000.00, 1.3, '{"description": "Premium fordele med ekstra belønninger", "features": ["30% bonus points", "VIP kundeservice", "Ugentlig gratis billet", "Early access til nye lodder", "Eksklusive tilbud"]}', '#FFD700', '🥇'),
('diamond', 'Diamond', 10000.00, 1.5, '{"description": "Elite status med maksimale fordele", "features": ["50% bonus points", "Personlig rådgiver", "Daglige gratis billetter", "Eksklusive Diamond lodtrækninger", "Premium support", "Invitationer til events"]}', '#B9F2FF', '💎');

-- Function to update user loyalty tier based on total spent
CREATE OR REPLACE FUNCTION update_loyalty_tier(user_id_param UUID)
RETURNS VOID AS $$
DECLARE
    user_spent DECIMAL(12,2);
    new_tier VARCHAR(20);
BEGIN
    -- Get user's total spent
    SELECT total_spent INTO user_spent
    FROM users
    WHERE id = user_id_param;
    
    -- Determine new tier
    SELECT tier INTO new_tier
    FROM loyalty_tiers
    WHERE user_spent >= min_spent
    ORDER BY min_spent DESC
    LIMIT 1;
    
    -- Update user's tier
    UPDATE users
    SET loyalty_tier = new_tier
    WHERE id = user_id_param;
END;
$$ language 'plpgsql';

-- Function to calculate and award points for purchase
CREATE OR REPLACE FUNCTION award_points_for_purchase()
RETURNS TRIGGER AS $$
DECLARE
    base_points INTEGER;
    bonus_points INTEGER := 0;
    total_points INTEGER;
    user_tier VARCHAR(20);
    tier_multiplier DECIMAL(3,2);
BEGIN
    -- Only award points for completed payments
    IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
        -- Calculate base points (1 kr = 1 point)
        base_points := FLOOR(NEW.total_amount);
        
        -- Get user's current tier and multiplier
        SELECT u.loyalty_tier, COALESCE(lt.points_multiplier, 1.00)
        INTO user_tier, tier_multiplier
        FROM users u
        LEFT JOIN loyalty_tiers lt ON u.loyalty_tier = lt.tier
        WHERE u.id = NEW.user_id;
        
        -- Apply tier multiplier
        total_points := FLOOR(base_points * tier_multiplier);
        
        -- Quantity bonus: 5+ tickets = 10% bonus, 10+ tickets = 20% bonus, 25+ tickets = 30% bonus
        IF NEW.quantity >= 25 THEN
            bonus_points := FLOOR(total_points * 0.30);
        ELSIF NEW.quantity >= 10 THEN
            bonus_points := FLOOR(total_points * 0.20);
        ELSIF NEW.quantity >= 5 THEN
            bonus_points := FLOOR(total_points * 0.10);
        END IF;
        
        total_points := total_points + bonus_points;
        
        -- Add points to user
        UPDATE users
        SET points = points + total_points,
            total_spent = total_spent + NEW.total_amount
        WHERE id = NEW.user_id;
        
        -- Record point transaction
        INSERT INTO point_transactions (user_id, raffle_entry_id, type, points, description, metadata)
        VALUES (
            NEW.user_id,
            NEW.id,
            'earned',
            total_points,
            FORMAT('Points optjent for køb af %s billetter', NEW.quantity),
            jsonb_build_object(
                'base_points', base_points,
                'tier_multiplier', tier_multiplier,
                'quantity_bonus', bonus_points,
                'ticket_quantity', NEW.quantity,
                'tier', user_tier
            )
        );
        
        -- Update loyalty tier based on new total spent
        PERFORM update_loyalty_tier(NEW.user_id);
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to award points when payment is completed
CREATE TRIGGER award_points_trigger
    AFTER UPDATE ON raffle_entries
    FOR EACH ROW EXECUTE FUNCTION award_points_for_purchase();

INSERT INTO system_settings (key, value, description) VALUES
('site_name', '"DrawDash"', 'Site name displayed in header and meta tags'),
('contact_email', '"support@drawdash.com"', 'Contact email for customer support'),
('min_ticket_price', '0.50', 'Minimum allowed ticket price in GBP'),
('max_ticket_price', '100.00', 'Maximum allowed ticket price in GBP'),
('max_tickets_per_purchase', '50', 'Maximum number of tickets a user can buy in one transaction'),
('payment_provider', '"stripe"', 'Payment provider (stripe, paypal, etc.)'),
('facebook_page_url', '"https://facebook.com/drawdash"', 'Facebook page URL for live draws'),
('terms_version', '"1.0"', 'Current version of terms and conditions'),
('privacy_version', '"1.0"', 'Current version of privacy policy'),
('loyalty_points_per_kroner', '1', 'Base points earned per Danish kroner spent'),
('max_points_redemption_percentage', '50', 'Maximum percentage of cart value that can be paid with points'),
('points_redemption_rate', '200', 'Points required to redeem 1 Danish krone (200 points = 1 kr)');