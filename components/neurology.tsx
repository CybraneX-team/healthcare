'use client'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
      when: 'afterChildren',
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
}

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
  exit: {
    y: -15,
    opacity: 0,
    transition: { duration: 0.25, ease: 'easeIn' },
  },
}

export default function Component({ extractedLabData }: any) {
  const brain = extractedLabData?.brain || {}
  const neurotransmitters = brain?.neurotransmitters || {}
  // console.log("brain is : ", brain )
  return (
    <div className="h-full overflow-y-auto md:overflow-y-hidden p-3 sm:p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 h-auto lg:h-[600px]"
      >
        {/* Neurology Section - Left Column */}
        <div className="lg:col-span-5 grid grid-rows-1 lg:grid-rows-2 gap-4">
          {/* Top Neurology Card */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-sm border-0 bg-white rounded-3xl hover:shadow-md transition-shadow duration-300 h-auto">
              <CardContent className="p-4 space-y-6 md:-mb-4">
                {/* Header with Brain Icon and Healthy Badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
                      {/* Full SVG preserved exactly as you had it */}
                      <svg
                        width="29"
                        height="29"
                        viewBox="0 0 29 29"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M27.2595 13.1405C27.2595 12.0745 26.7783 11.0755 25.9585 10.4105C25.9942 10.2403 26.0119 10.0767 26.0119 9.91575C26.0119 8.58784 25.0299 7.48496 23.7542 7.29501C23.7835 7.14247 23.7974 6.99284 23.7974 6.84377C23.7974 5.43002 22.6833 4.27495 21.2875 4.20158C21.2646 4.19781 21.2414 4.19462 21.2173 4.19462C21.2057 4.19462 21.1944 4.19607 21.1825 4.19636C21.1709 4.19607 21.1596 4.19462 21.1477 4.19462C21.0149 4.19462 20.8812 4.20651 20.74 4.23116C20.4946 2.93051 19.3616 1.96191 18.0032 1.96191C16.4631 1.96191 15.21 3.215 15.21 4.75548V23.8717C15.21 25.8214 16.796 27.4071 18.7454 27.4071C20.0388 27.4071 21.2127 26.7073 21.8327 25.5958C21.9716 25.6259 22.105 25.6445 22.239 25.6532C23.0808 25.7068 23.9007 25.431 24.5375 24.8722C25.1744 24.3134 25.5554 23.5399 25.6105 22.6943C25.6334 22.342 25.594 21.9884 25.4936 21.6393C26.5945 20.8589 27.2415 19.6232 27.2415 18.2692C27.2415 17.2875 26.888 16.345 26.2424 15.5942C26.892 14.9365 27.2595 14.0567 27.2595 13.1405ZM26.3721 18.2698C26.3721 19.2801 25.9133 20.207 25.1265 20.8273C24.5442 19.9004 23.5112 19.3086 22.3927 19.3086C22.1526 19.3086 21.9577 19.5034 21.9577 19.7436C21.9577 19.9837 22.1526 20.1786 22.3927 20.1786C23.3616 20.1786 24.244 20.7855 24.5915 21.6889C24.7104 22.0044 24.7631 22.3237 24.7425 22.6383C24.7025 23.252 24.4262 23.8131 23.9639 24.2185C23.5016 24.6243 22.908 24.8258 22.2958 24.7852C22.1236 24.7739 21.9455 24.7368 21.7352 24.6686C21.5206 24.5984 21.2884 24.7046 21.1999 24.9122C20.7809 25.8994 19.8172 26.5374 18.7451 26.5374C17.2753 26.5374 16.0797 25.3417 16.0797 23.872V4.75577C16.0797 3.69524 16.9424 2.8322 18.0029 2.8322C18.9884 2.8322 19.7992 3.57518 19.9048 4.54552C19.107 5.00256 18.5673 5.86067 18.5673 6.84406C18.5673 7.08447 18.7622 7.27906 19.0023 7.27906C19.2424 7.27906 19.4373 7.08447 19.4373 6.84406C19.4373 5.87459 20.2171 5.08521 21.1819 5.06636C22.1468 5.08521 22.9266 5.87459 22.9266 6.84377C22.9266 7.02415 22.8926 7.21091 22.8225 7.41536C22.8059 7.4635 22.7981 7.51396 22.799 7.56471C22.7993 7.5766 22.7998 7.58763 22.801 7.59806C22.7993 7.60416 22.7981 7.60821 22.7981 7.60821C22.7639 7.74306 22.7964 7.88632 22.8854 7.99333C22.9744 8.10034 23.1072 8.15834 23.2482 8.14935C23.2783 8.14732 23.3085 8.14355 23.3619 8.13601C24.3429 8.13601 25.1413 8.93439 25.1413 9.91546C25.1413 10.0813 25.1114 10.2516 25.0479 10.4517C24.9891 10.6358 25.0589 10.8368 25.2193 10.9447C25.9252 11.42 26.3529 12.2001 26.3834 13.0448C26.3834 13.046 26.3831 13.0472 26.3831 13.0483C26.3831 14.507 25.1964 15.694 23.7377 15.694C22.279 15.694 21.092 14.507 21.092 13.0483C21.092 12.8079 20.8972 12.6133 20.657 12.6133C20.4169 12.6133 20.222 12.8079 20.222 13.0483C20.222 14.987 21.799 16.564 23.7377 16.564C24.3838 16.564 24.9876 16.3856 25.5084 16.0803C26.0652 16.6864 26.3721 17.4615 26.3721 18.2698Z"
                          fill="#7F7F82"
                        />
                        <path
                          d="M11.072 1.9624C9.71369 1.9624 8.58095 2.931 8.3359 4.23165C8.19438 4.207 8.06069 4.19511 7.92787 4.19511C7.91627 4.19511 7.90496 4.19656 7.89307 4.19685C7.88147 4.19656 7.87016 4.19511 7.85827 4.19511C7.8342 4.19511 7.811 4.1983 7.78809 4.20207C6.39232 4.27544 5.27843 5.43051 5.27843 6.84426C5.27843 6.99332 5.29264 7.14296 5.32164 7.2955C4.04593 7.48545 3.06399 8.58832 3.06399 9.91623C3.06399 10.0769 3.08168 10.2405 3.11735 10.411C2.29752 11.0759 1.81641 12.075 1.81641 13.141C1.81641 14.0571 2.18355 14.937 2.83286 15.5953C2.18703 16.3461 1.83352 17.2886 1.83352 18.2703C1.83352 19.6243 2.48051 20.8597 3.58135 21.6404C3.48072 21.9895 3.44157 22.343 3.46477 22.6957C3.51987 23.541 3.90064 24.3144 4.53748 24.8733C5.17432 25.4324 5.99183 25.7082 6.83602 25.6542C6.96797 25.6455 7.10253 25.6264 7.24202 25.5965C7.86204 26.7084 9.03596 27.4082 10.3294 27.4082C12.2787 27.4082 13.8647 25.8222 13.8647 23.8728V4.75597C13.8653 3.21549 12.6122 1.9624 11.072 1.9624ZM12.9953 23.8722C12.9953 25.3419 11.7997 26.5376 10.3299 26.5376C9.25781 26.5376 8.29414 25.8996 7.87538 24.9124C7.80549 24.748 7.64541 24.6474 7.47489 24.6474C7.43023 24.6474 7.3847 24.654 7.34004 24.6688C7.13008 24.737 6.95202 24.7741 6.77947 24.7854C6.16496 24.8257 5.57365 24.6242 5.11168 24.2187C4.64942 23.8133 4.37305 23.2522 4.33303 22.6385C4.31099 22.3021 4.36928 21.9611 4.50645 21.625C4.50848 21.6201 4.5079 21.6145 4.50964 21.6096C4.89882 20.7234 5.73489 20.1732 6.71277 20.1732C6.95318 20.1732 7.14777 19.9784 7.14777 19.7382C7.14777 19.4981 6.95318 19.3032 6.71277 19.3032C5.57075 19.3032 4.53748 19.8853 3.94385 20.8226C3.16056 20.2022 2.70352 19.2777 2.70352 18.27C2.70352 17.4617 3.01092 16.6866 3.56714 16.0808C4.08798 16.3861 4.69205 16.5645 5.33817 16.5645C7.27682 16.5645 8.85384 14.9875 8.85384 13.0488C8.85384 12.8084 8.65925 12.6138 8.41884 12.6138C8.17843 12.6138 7.98384 12.8084 7.98384 13.0488C7.98384 14.5075 6.79716 15.6945 5.33817 15.6945C3.87918 15.6945 2.6925 14.5075 2.6925 13.0488C2.6925 13.0482 2.69221 13.0477 2.69221 13.0471C2.72208 12.2017 3.14983 11.421 3.85598 10.9452C4.01635 10.8373 4.08595 10.6366 4.02737 10.4524C3.96357 10.2521 3.93399 10.0818 3.93399 9.91594C3.93399 8.9369 4.72888 8.13969 5.73054 8.13969C5.73257 8.13969 5.73489 8.13969 5.73692 8.13969C5.76679 8.14375 5.79666 8.14752 5.82711 8.14955C5.96776 8.15825 6.10203 8.09996 6.19077 7.99237C6.2798 7.88449 6.3117 7.74065 6.27603 7.60551C6.27603 7.60522 6.27516 7.60145 6.27371 7.59652C6.27458 7.58637 6.27545 7.57709 6.27574 7.56897C6.27719 7.51677 6.26936 7.46486 6.25225 7.41556C6.18207 7.21053 6.14814 7.02348 6.14814 6.84368C6.14814 5.8745 6.92766 5.08483 7.89278 5.06627C8.8579 5.08512 9.63742 5.8745 9.63742 6.84397C9.63742 7.08438 9.83201 7.27897 10.0724 7.27897C10.3128 7.27897 10.5074 7.08438 10.5074 6.84397C10.5074 5.86058 9.96773 5.00247 9.16994 4.54543C9.2755 3.57509 10.0863 2.83211 11.0718 2.83211C12.1323 2.83211 12.995 3.69515 12.995 4.75568L12.9953 23.8722Z"
                          fill="#7F7F82"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm mb-1">RMSSD</div>
                      <div className="text-sm font-bold text-gray-900">
                        {brain?.rmssd != null ? `${brain.rmssd} ms` : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-sm mb-1">SDNN</div>
                      <div className="text-sm font-bold text-gray-900">
                        {brain?.sdnn != null ? `${brain.sdnn} ms` : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 px-4 mx-4 my-4 py-2 rounded-full text-sm font-medium border-0">
                    Healthy
                  </Badge>
                </div>

                {/* Gait Readiness */}
                <div className="flex flex-row justify-between">
                  <div>
                    <div className="text-gray-500 text-sm mb-2">
                      Gait Readiness
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {brain?.gait_readiness != null
                        ? `${brain.gait_readiness} ms`
                        : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gray-100 px-4 py-2 h-10 mt-3 rounded-3xl text-gray-600 text-sm font-medium">
                    Calculate Stress
                  </div>
                </div>

                <div className="bg-gray-100 flex justify-between px-4 py-12 rounded-3xl">
                  {/* CD-RISC Score */}
                  <div>
                    <div className="text-gray-500 text-sm">CD-RISC:</div>
                    <div className="text-lg font-bold text-gray-900">
                      {brain?.cd_risc != null ? `${brain.cd_risc}/100` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-900 font-bold text-lg">
                      PTau-217
                    </div>
                    <div className="text-lg font-normal text-gray-600">
                      {brain?.p_tau217 != null
                        ? `${brain.p_tau217} pg/mL`
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bottom Symptoms Log Card */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-sm border-0 bg-white rounded-2xl hover:shadow-md transition-shadow duration-300 h-auto">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
                  MRI {/* <br /> */}
                  log's
                </h3>

                {/* <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700 text-xs sm:text-sm">
                      Above high Heart Rate
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700 text-xs sm:text-sm">
                      Cholesterol in control in last 30 days
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-gray-700 text-xs sm:text-sm">
                      Rythmic heartbeat
                    </span>
                  </div>
                </div> */}
                <span className="text-gray-700 text-xs sm:text-sm">
                  {brain?.mri ? brain?.mri : ''}
                </span>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Neurotransmitters Section - Right Column */}
        <motion.div variants={itemVariants} className="lg:col-span-7">
          <Card className="shadow-sm border-0 bg-white rounded-3xl hover:shadow-md transition-shadow duration-300 h-auto">
            <CardContent className="p-2">
              <h2 className="text-xl p-4 sm:text-2xl font-semibold text-gray-900 mb-8 sm:mb-6">
                Neurotransmitters
              </h2>

              <div className="flex flex-col gap-1">
                {/* Dopamine */}
                <div className="bg-gray-100 rounded-3xl p-3 sm:p-4">
                  <div className="text-gray-900 font-medium mb-1 text-sm sm:text-base">
                    Dopamine
                  </div>
                  <div className="text-gray-500 text-xs mb-4 sm:mb-10">
                    Involved in pleasure
                  </div>
                  <div className="text-base mt-12 sm:text-lg font-semibold text-gray-900">
                    {neurotransmitters?.dopamine != null
                      ? `${neurotransmitters.dopamine} μM`
                      : 'N/A'}
                  </div>
                </div>

                {/* Serotonin */}
                <div className="bg-gray-100 rounded-3xl p-3 sm:p-4">
                  <div className="text-gray-900 font-medium mb-1 text-sm sm:text-base">
                    Serotonin
                  </div>
                  <div className="text-gray-500 text-xs mb-4 sm:mb-10">
                    Low Levels indicates Depression
                  </div>
                  <div className="text-base mt-12 sm:text-lg font-semibold text-gray-900">
                    {neurotransmitters?.serotonin != null
                      ? `${neurotransmitters.serotonin} μM`
                      : 'N/A'}
                  </div>
                </div>

                {/* GABA */}
                <div className="bg-gray-100 rounded-3xl p-3 sm:p-4">
                  <div className="text-gray-900 font-medium mb-1 text-sm sm:text-base">
                    GABA
                  </div>
                  <div className="text-gray-500 text-xs mb-4 sm:mb-10">
                    Endorphin
                  </div>
                  <div className="text-base mt-12 sm:text-lg font-semibold text-gray-900">
                    {neurotransmitters?.gaba != null
                      ? `${neurotransmitters.gaba} μM`
                      : 'N/A'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
