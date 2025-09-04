'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Balance } from '@/lib/balanceService'
import { Payouts, PayoutMethod } from '@/lib/payoutService'

interface PayoutRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function PayoutRequestModal({ isOpen, onClose, onSuccess }: PayoutRequestModalProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<'amount' | 'method' | 'confirm' | 'success'>('amount')
  const [amount, setAmount] = useState('')
  const [selectedMethod, setSelectedMethod] = useState<PayoutMethod | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  // Form state for new method
  const [newMethodType, setNewMethodType] = useState<'bank_transfer' | 'mobilepay' | 'paypal'>('bank_transfer')
  const [newMethodDetails, setNewMethodDetails] = useState({
    name: '',
    bankName: '',
    accountNumber: '',
    registrationNumber: '',
    mobilePayNumber: '',
    paypalEmail: ''
  })

  const [balance, setBalance] = useState<any>(null)
  const [limits, setLimits] = useState<any>(null)
  const [methods, setMethods] = useState<PayoutMethod[]>([])

  useEffect(() => {
    if (isOpen && user?.id) {
      loadData()
      setStep('amount')
      setError('')
    }
  }, [isOpen, user?.id])

  const loadData = () => {
    if (!user?.id) return
    
    const userBalance = Balance.getBalance(user.id)
    const userLimits = Payouts.getLimits(user.id)
    const userMethods = Payouts.getMethods(user.id)
    
    setBalance(userBalance)
    setLimits(userLimits)
    setMethods(userMethods)
    
    // Select default method if available
    const defaultMethod = userMethods.find(m => m.isDefault)
    if (defaultMethod) {
      setSelectedMethod(defaultMethod)
    }
  }

  const handleAmountSubmit = () => {
    const amountValue = parseFloat(amount)
    
    if (isNaN(amountValue) || amountValue <= 0) {
      setError('Indtast et gyldigt beløb')
      return
    }

    const validation = Balance.validateWithdrawal(user!.id, amountValue)
    if (!validation.valid) {
      setError(validation.error || 'Ugyldigt beløb')
      return
    }

    if (amountValue > (limits?.single.max || 50000)) {
      setError(`Maksimum pr. udbetaling er ${limits?.single.max.toLocaleString('da-DK')} DKK`)
      return
    }

    if (amountValue > balance?.cashBalance) {
      setError(`Utilstrækkelig cash saldo: ${balance?.cashBalance.toLocaleString('da-DK')} DKK tilgængelig`)
      return
    }

    setError('')
    setStep('method')
  }

  const handleMethodSelection = (method: PayoutMethod) => {
    setSelectedMethod(method)
    setStep('confirm')
  }

  const addNewMethod = () => {
    if (!user?.id) return

    const validation = Payouts.validateMethod(newMethodType, newMethodDetails)
    if (!validation.valid) {
      setError(validation.error || 'Ugyldig metode')
      return
    }

    const method = Payouts.addMethod(user.id, {
      type: newMethodType,
      name: newMethodDetails.name,
      isDefault: methods.length === 0,
      details: newMethodDetails
    })

    setMethods([...methods, method])
    setSelectedMethod(method)
    setStep('confirm')
  }

  const handleSubmit = async () => {
    if (!user?.id || !selectedMethod) return

    setIsSubmitting(true)
    setError('')

    try {
      const result = await Payouts.submitWithdrawal(
        user.id,
        parseFloat(amount),
        selectedMethod.id,
        'mock_ip',
        'mock_user_agent'
      )

      if (result.success) {
        setStep('success')
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 3000)
      } else {
        setError(result.error || 'Udbetaling fejlede')
      }
    } catch (err) {
      setError('Teknisk fejl - prøv igen senere')
    }

    setIsSubmitting(false)
  }

  const calculateFee = () => {
    const amountValue = parseFloat(amount)
    if (isNaN(amountValue)) return 0
    
    const feeRate = 0.015 // 1.5%
    const feeAmount = amountValue * feeRate
    return Math.max(10, Math.min(100, feeAmount)) // 10-100 DKK
  }

  const getNetAmount = () => {
    const amountValue = parseFloat(amount)
    if (isNaN(amountValue)) return 0
    return amountValue - calculateFee()
  }

  if (!isOpen || !balance || !limits) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Hæv Penge</h2>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Step Indicator */}
              <div className="flex items-center justify-center mb-6">
                {['amount', 'method', 'confirm', 'success'].map((s, index) => (
                  <div key={s} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step === s ? 'bg-blue-600 text-white' :
                      ['amount', 'method', 'confirm', 'success'].indexOf(step) > index ? 'bg-green-500 text-white' :
                      'bg-slate-200 text-slate-500'
                    }`}>
                      {index + 1}
                    </div>
                    {index < 3 && (
                      <div className={`w-8 h-0.5 mx-2 ${
                        ['amount', 'method', 'confirm', 'success'].indexOf(step) > index ? 'bg-green-500' : 'bg-slate-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Step Content */}
              {step === 'amount' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">Hvor meget vil du hæve?</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Tilgængelig cash saldo: {balance.cashBalance.toLocaleString('da-DK')} DKK
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Beløb (DKK)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="100"
                        min={limits.single.min}
                        max={Math.min(limits.single.max, balance.cashBalance)}
                        className="w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium text-center"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>Min: {limits.single.min.toLocaleString('da-DK')} DKK</span>
                      <span>Max: {limits.single.max.toLocaleString('da-DK')} DKK</span>
                    </div>
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {[100, 500, 1000].filter(amt => amt <= balance.cashBalance).map(amt => (
                      <button
                        key={amt}
                        onClick={() => setAmount(amt.toString())}
                        className="py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        {amt.toLocaleString('da-DK')} DKK
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleAmountSubmit}
                    disabled={!amount}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Næste
                  </button>
                </div>
              )}

              {step === 'method' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Vælg udbetalingsmetode</h3>

                  {/* Existing Methods */}
                  <div className="space-y-3">
                    {methods.map(method => (
                      <button
                        key={method.id}
                        onClick={() => handleMethodSelection(method)}
                        className="w-full p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {method.type === 'bank_transfer' ? '🏦' :
                             method.type === 'mobilepay' ? '📱' : '💼'}
                          </span>
                          <div>
                            <div className="font-medium text-slate-900">{method.name}</div>
                            <div className="text-sm text-slate-500">
                              {method.type === 'bank_transfer' && method.details.accountNumber &&
                                `****${method.details.accountNumber.slice(-4)}`
                              }
                              {method.type === 'mobilepay' && method.details.mobilePayNumber}
                              {method.type === 'paypal' && method.details.paypalEmail}
                            </div>
                          </div>
                          {method.isDefault && (
                            <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              Standard
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Add New Method */}
                  <div className="border-t border-slate-200 pt-4">
                    <h4 className="font-medium text-slate-700 mb-3">Tilføj ny metode</h4>
                    
                    {/* Method Type Selector */}
                    <div className="flex gap-2 mb-4">
                      {[
                        { key: 'bank_transfer', label: 'Bank', icon: '🏦' },
                        { key: 'mobilepay', label: 'MobilePay', icon: '📱' },
                        { key: 'paypal', label: 'PayPal', icon: '💼' }
                      ].map(type => (
                        <button
                          key={type.key}
                          onClick={() => setNewMethodType(type.key as any)}
                          className={`flex-1 py-2 px-3 text-sm rounded-lg border transition-colors ${
                            newMethodType === type.key
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {type.icon} {type.label}
                        </button>
                      ))}
                    </div>

                    {/* Method Details Form */}
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Navn på metode"
                        value={newMethodDetails.name}
                        onChange={(e) => setNewMethodDetails({...newMethodDetails, name: e.target.value})}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />

                      {newMethodType === 'bank_transfer' && (
                        <>
                          <input
                            type="text"
                            placeholder="Banknavn"
                            value={newMethodDetails.bankName}
                            onChange={(e) => setNewMethodDetails({...newMethodDetails, bankName: e.target.value})}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Reg. nr. (4 cifre)"
                              value={newMethodDetails.registrationNumber}
                              onChange={(e) => setNewMethodDetails({...newMethodDetails, registrationNumber: e.target.value})}
                              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                              type="text"
                              placeholder="Kontonummer"
                              value={newMethodDetails.accountNumber}
                              onChange={(e) => setNewMethodDetails({...newMethodDetails, accountNumber: e.target.value})}
                              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </>
                      )}

                      {newMethodType === 'mobilepay' && (
                        <input
                          type="tel"
                          placeholder="+45 12 34 56 78"
                          value={newMethodDetails.mobilePayNumber}
                          onChange={(e) => setNewMethodDetails({...newMethodDetails, mobilePayNumber: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      )}

                      {newMethodType === 'paypal' && (
                        <input
                          type="email"
                          placeholder="din@email.com"
                          value={newMethodDetails.paypalEmail}
                          onChange={(e) => setNewMethodDetails({...newMethodDetails, paypalEmail: e.target.value})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      )}

                      <button
                        onClick={addNewMethod}
                        disabled={!newMethodDetails.name}
                        className="w-full py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-300 transition-colors"
                      >
                        Tilføj & Vælg Metode
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 'confirm' && selectedMethod && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Bekræft udbetaling</h3>

                  {/* Summary */}
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Beløb:</span>
                      <span className="font-medium">{parseFloat(amount).toLocaleString('da-DK')} DKK</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Behandlingsgebyr:</span>
                      <span className="font-medium">-{calculateFee().toLocaleString('da-DK')} DKK</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-3">
                      <span>Du modtager:</span>
                      <span className="text-green-600">{getNetAmount().toLocaleString('da-DK')} DKK</span>
                    </div>
                  </div>

                  {/* Method Details */}
                  <div className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">
                        {selectedMethod.type === 'bank_transfer' ? '🏦' :
                         selectedMethod.type === 'mobilepay' ? '📱' : '💼'}
                      </span>
                      <span className="font-medium text-slate-900">{selectedMethod.name}</span>
                    </div>
                    <div className="text-sm text-slate-600">
                      {selectedMethod.type === 'bank_transfer' && selectedMethod.details.accountNumber &&
                        `****${selectedMethod.details.accountNumber.slice(-4)}`
                      }
                      {selectedMethod.type === 'mobilepay' && selectedMethod.details.mobilePayNumber}
                      {selectedMethod.type === 'paypal' && selectedMethod.details.paypalEmail}
                    </div>
                  </div>

                  {/* Processing Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-blue-800">Behandlingstid</p>
                        <p className="text-sm text-blue-700">
                          {selectedMethod.type === 'bank_transfer' ? '1-3 arbejdsdage' :
                           selectedMethod.type === 'mobilepay' ? 'Øjeblikkeligt' : '1-2 arbejdsdage'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('method')}
                      className="flex-1 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Tilbage
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                    >
                      {isSubmitting ? 'Behandler...' : 'Bekræft Udbetaling'}
                    </button>
                  </div>
                </div>
              )}

              {step === 'success' && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Udbetaling Anmodet!</h3>
                  <p className="text-slate-600">
                    Din udbetaling på {getNetAmount().toLocaleString('da-DK')} DKK er sendt til behandling.
                  </p>
                  <p className="text-sm text-slate-500">
                    Du vil modtage en bekræftelse når pengene er overført.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}