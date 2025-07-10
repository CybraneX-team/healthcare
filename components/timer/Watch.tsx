// Final updated code for stopwatch-based session tracker

'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { db } from '@/utils/firebase'
import { toast } from 'react-toastify'
import MyStopwatch from './MyStopwatch'

const presetActivities = [
  'Jump Rope',
  'Meditation',
  'Workout',
  'Study',
  'Yoga',
  'Stretching',
  'Pushups',
  'HIIT',
  'Deep Breathing',
  'Walking',
  'Reading',
  'Cycling',
  'Running',
  'Boxing',
  'Dancing',
  'Plank',
  'Jogging',
  'Mindfulness',
  'Pilates',
  'Tai Chi',
  'Breathwork',
  'Balance Practice',
  'Foam Rolling',
  'Zumba',
  'Skipping',
  'Resistance Training',
  'Tai-Bo',
  'Martial Arts',
  'Aerobics',
  'Power Yoga',
  'Strength Circuit',
  'Cardio Burn',
]

function formatDuration(duration: number) {
  if (typeof duration !== 'number') return ''
  const min = Math.floor(duration / 60)
  const sec = duration % 60
  return `${min ? `${min} min` : ''}${sec ? ` ${sec} sec` : ''}`.trim()
}

export default function Watch() {
  const [activity, setActivity] = useState('')
  const [showTimer, setShowTimer] = useState(false)
  const [activities, setActivities] = useState([])
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    const fetchActivities = async () => {
      const user = getAuth().currentUser
      if (user) {
        const userRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userRef)
        if (userSnap.exists()) {
          const data = userSnap.data()
          setActivities(data.activities || [])
        }
      }
    }
    fetchActivities()
  }, [reloadKey])

  const deleteActivity = async (item: any) => {
    const user = getAuth().currentUser
    if (!user) return
    const userRef = doc(db, 'users', user.uid)
    await updateDoc(userRef, {
      activities: arrayRemove(item),
    })
    setActivities((prev) => prev.filter((a) => a !== item))
    toast.success('Activity deleted successfully!')
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    if (!activity.trim()) return alert('Please enter a valid activity.')
    setShowTimer(true)
  }

  return (
    <div className=" min-h-screen w-auto bg-[#f7faff]  overflow-hidden">
      <AnimatePresence>
        {!showTimer ? (
          <>
            <motion.form
              key="form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              transition={{ duration: 0.8 }}
              className="w-full h-full px-12 py-16 flex flex-col justify-center items-center gap-10"
            >
              <h1 className="text-4xl font-extrabold text-[#1e3a8a]">
                Start Stopwatch
              </h1>

              <div className="w-full max-w-4xl">
                <label className="text-lg font-medium text-gray-700">
                  Activity
                </label>
                <input
                  type="text"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  className="w-full p-4 text-xl mt-2 text-gray-900 placeholder:text-gray-400 border-2 border-blue-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="e.g. Jump Rope"
                  required
                />
                <div className="flex flex-wrap gap-3 mt-4">
                  {presetActivities.map((act) => (
                    <button
                      type="button"
                      key={act}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition"
                      onClick={() => setActivity(act)}
                    >
                      {act}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-6 mt-10">
                <button
                  type="submit"
                  className="px-8 py-4 bg-blue-600 text-white text-lg rounded-xl hover:bg-blue-700 transition"
                >
                  Start Session
                </button>
              </div>
            </motion.form>

            <div className="w-full flex justify-center mt-12 px-4">
              <div className="w-full max-w-2xl">
                <h3 className="text-2xl font-semibold mb-6 text-center text-gray-800">
                  Your Activity History
                </h3>
                {activities.length === 0 ? (
                  <p className="text-gray-500 text-center">
                    No activities logged yet.
                  </p>
                ) : (
                  <ul className="space-y-6">
                    {activities
                      .slice()
                      .reverse()
                      .map((act: any, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between p-5 bg-white border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all"
                        >
                          <div>
                            <div className="font-semibold text-lg text-gray-800">
                              {act.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatDuration(act.duration)} ·{' '}
                              {new Date(
                                act.completedAt?.seconds * 1000,
                              ).toLocaleString()}
                            </div>
                          </div>
                          <button
                            onClick={() => deleteActivity(act)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        ) : (
          <MyStopwatch
            activity={activity}
            goBack={() => {
              setShowTimer(false)
              setReloadKey((prev) => prev + 1)
              setActivity('')
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
