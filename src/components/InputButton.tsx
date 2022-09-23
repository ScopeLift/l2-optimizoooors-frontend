import React, { useState } from 'react'

interface Props {
  buttonName: string
}

export default function InputButton({buttonName}: Props) {

  const [amount, setAmount] = useState('');

  return (
    <div>
        <div className="flex bg-gray-100 rounded-xl p-4">
        <div>
          <input
            type="number"
            step="0.000001"
            aria-label="Amount (ether)"
            onChange={(e) => {
              setAmount(e.target.value)
              }
            }
            placeholder="0.0"
            value={amount}
            className="box-content py-2 w-32 text-start h-5 mr-2 outline-none bg-transparent ring-none
            rounded-xl [appearance:textfield]
            disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none
            invalid:border-red-500 invalid:text-red-600
            focus:invalid:border-red-500 focus:invalid:ring-red-500
          "
          />
        </div>

          <button onClick={() => alert("Feature not yet implemented. Please interact with the contracts directly. https://github.com/ScopeLift/l2-optimizoooors")} className='tailwind-btn w-28'>
            {buttonName}
          </button>
        </div>
    </div>
  )
}
