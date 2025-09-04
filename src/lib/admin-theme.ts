export const adminTheme = {
  // Spacing system
  spacing: {
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  },
  
  // Border radius
  rounded: {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl'
  },
  
  // Colors - Professional CRM palette
  colors: {
    // Background
    background: 'bg-slate-50',
    surface: 'bg-white',
    
    // Borders
    border: {
      default: 'border-slate-200',
      light: 'border-slate-100',
      strong: 'border-slate-300'
    },
    
    // Text
    text: {
      primary: 'text-slate-900',
      secondary: 'text-slate-600',
      muted: 'text-slate-500',
      light: 'text-slate-400'
    },
    
    // Interactive states
    hover: 'hover:bg-slate-50',
    active: 'bg-slate-100',
    focus: 'focus:ring-2 focus:ring-slate-500 focus:border-transparent',
    
    // Status colors (minimal usage)
    status: {
      success: {
        text: 'text-green-700',
        bg: 'bg-green-50',
        border: 'border-green-200'
      },
      warning: {
        text: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200'
      },
      error: {
        text: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200'
      },
      info: {
        text: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-200'
      }
    }
  },
  
  // Buttons
  buttons: {
    primary: 'bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-md font-medium transition-colors',
    secondary: 'border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-md font-medium transition-colors',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-md transition-colors',
    danger: 'text-red-600 hover:bg-red-50 px-3 py-2 rounded-md transition-colors'
  },
  
  // Cards
  card: {
    default: 'bg-white border border-slate-200 rounded-lg shadow-sm',
    hover: 'bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow'
  },
  
  // Table
  table: {
    header: 'bg-slate-50 border-b border-slate-200',
    row: 'hover:bg-slate-50 transition-colors',
    cell: 'px-6 py-4 text-sm'
  },
  
  // Icons - All in consistent slate-400
  icon: 'w-5 h-5 text-slate-400',
  iconLarge: 'w-6 h-6 text-slate-400',
  
  // Navigation
  nav: {
    item: 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 px-3 py-2 text-sm font-medium rounded-md flex items-center gap-3 transition-colors',
    active: 'bg-slate-100 text-slate-900 px-3 py-2 text-sm font-medium rounded-md flex items-center gap-3'
  }
}

// Component utilities
export const getStatusClasses = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'completed':
    case 'success':
      return `${adminTheme.colors.status.success.bg} ${adminTheme.colors.status.success.text} ${adminTheme.colors.status.success.border}`
    
    case 'pending':
    case 'warning':
      return `${adminTheme.colors.status.warning.bg} ${adminTheme.colors.status.warning.text} ${adminTheme.colors.status.warning.border}`
    
    case 'failed':
    case 'error':
    case 'blocked':
      return `${adminTheme.colors.status.error.bg} ${adminTheme.colors.status.error.text} ${adminTheme.colors.status.error.border}`
    
    default:
      return `${adminTheme.colors.status.info.bg} ${adminTheme.colors.status.info.text} ${adminTheme.colors.status.info.border}`
  }
}

export const getNumberDisplay = (value: number, type: 'currency' | 'number' = 'number') => {
  if (type === 'currency') {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0
    }).format(value)
  }
  return new Intl.NumberFormat('da-DK').format(value)
}