'use client'

import { CheckCircleIcon } from '@heroicons/react/24/solid'
import type { CheckoutData } from '@/types'

interface CheckoutStepperProps {
  currentStep: CheckoutData['step']
}

const steps = [
  { id: 'address', label: 'العنوان', icon: '📍' },
  { id: 'shipping', label: 'الشحن', icon: '🚚' },
  { id: 'payment', label: 'الدفع', icon: '💳' },
  { id: 'review', label: 'المراجعة', icon: '✅' },
] as const

export default function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep)
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex
          const isCurrent = index === currentStepIndex
          const isUpcoming = index > currentStepIndex
          
          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    relative flex items-center justify-center w-12 h-12 rounded-full
                    transition-all duration-300 border-2
                    ${isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isCurrent
                      ? 'bg-brand-500 border-brand-500 text-white'
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                    }
                  `}
                >
                  {isCompleted ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    <span className="text-xl">{step.icon}</span>
                  )}
                  
                  {isCurrent && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
                    </span>
                  )}
                </div>
                
                {/* Step Label */}
                <div className="mt-2 text-center">
                  <p
                    className={`
                      text-sm font-medium
                      ${isCompleted || isCurrent
                        ? 'text-gray-900'
                        : 'text-gray-400'
                      }
                    `}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2 h-0.5 -mt-6">
                  <div
                    className={`
                      h-full transition-all duration-500
                      ${isCompleted
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                      }
                    `}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
