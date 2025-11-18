import React from 'react'
import { Privacyitems as items } from '../../utils/Constants';

const About = () => {

  

      
  return (
    <section>
        <div className='md:block hidden  max-w-7xl mx-auto mt-8 '>

            <div className="text-center mt-20">
                <h2 className="font-semibold leading-tight" style={{ fontSize: "clamp(1.75rem, 3vw, 3rem)" }}>
                We value your Privacy
                </h2>
                <p className="mx-auto mt-3 max-w-3xl text-gray-600 " style={{ fontSize: "clamp(0.95rem, 1.3vw, 1.2rem)" }}>
                EvalvoTech QBMS is built privacy-first: encrypted storage, strict access, and transparent controls. 
                You own your data—we guard it.
                </p>
            </div>

            {/* Trust badges */}
            <div className="mx-auto mt-8 flex max-w-4xl flex-wrap items-center justify-center gap-3 text-xs text-gray-500">
                <span className="rounded-full border-2 border-blue-700 px-3 py-1 ">Encryption: AES-256 / TLS</span>
                <span className="rounded-full border-2 border-blue-700 px-3 py-1 ">Role-Based Access</span>
                <span className="rounded-full border-2 border-blue-700 px-3 py-1 ">Audit Logs</span>
                <span className="rounded-full border-2 border-blue-700 px-3 py-1 ">Region-aware Hosting</span>
            </div>

            {/* Grid */}
            <div className="mt-10 grid grid-cols-3 gap-4 ">
                {items.map(({ icon: Icon, title, desc, bullets }) => (
                <div
                    key={title}
                    className="rounded-2xl p-5   "
                >
                    <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center  text-blue-700 ">
                        <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    </div>
                    <p className="mt-3 text-sm text-gray-600 ">{desc}</p>
                    <ul className="mt-3 space-y-1 text-sm text-gray-500 ">
                    {bullets.map((b) => (
                        <li key={b} className="list-disc pl-4">{b}</li>
                    ))}
                    </ul>
                </div>
                ))}
            </div>
        </div>

        <div className='md:hidden'>

        </div>
    </section>
  )
}

export default About
