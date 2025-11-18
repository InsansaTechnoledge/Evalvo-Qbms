import { Check } from 'lucide-react';
import React from 'react'
import { features } from '../../utils/Constants';



const FeaturesComponent = () => {
  return (
    <div className='max-w-7xl mx-auto min-h-screen pb-10' >
      {/* for laptop */}
      <div className='md:flex mt-10 hidden gap-10'>
        <div className=' w-3xl pt-10 mt-20'>
            <p className='text-[1vw] text-blue-600 font-bold'>Evalvo is Everything you need</p>
            <h1 className='text-[3vw]'>All-in-one  
                <span className='text-blue-600'> platform </span>
            </h1>
            <p className='text-md text-gray-500 text-left'>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sapiente reprehenderit quos amet doloremque at quisquam facilis vel quo vero? Eum quibusdam ullam deserunt eaque iusto natus ut accusamus placeat ipsa.</p>
        </div>  
        <div className='w-full pt-10'>
            <div className='grid grid-cols-2 gap-4'>
                {
                    features.map((f,id) => (
                        <div key={id}  className='flex gap-3'>
                            <Check className='w-12 h-12 text-blue-600'/>
                            <div className='flex flex-col'>
                                <p className='text-lg text-gray-600'>{f.name}</p>
                                <p className='text-md text-gray-400 mt-2'>{f.description}</p>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
      </div>    

      {/* for mobile */}
        <div className="md:hidden mt-10">
            <div className="px-4">
                {/* <p className="text-sm font-semibold text-blue-600">Everything you need</p> */}
                <h1 className="mt-3 text-2xl font-bold leading-tight">
                All you need in one <span className="text-blue-600">platform</span>
                </h1>
            </div>
            <div className="mt-6 px-4">
                <ul className="flex flex-col gap-3">
                {features.map((f, id) => (
                    <li
                    key={id}
                    className="flex items-start gap-3 rounded-xl  bg-white p-4  active:scale-[0.995] transition"
                    >
                
                    <div className="shrink-0 mt-1">
                        <Check className="w-5 h-5 text-blue-600" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-base font-medium text-gray-900">{f.name}</p>
                        <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                        {f.description}
                        </p>
                    </div>
                    </li>
                ))}
                </ul>
            </div>
        </div>

    </div>
  )
}

export default FeaturesComponent
