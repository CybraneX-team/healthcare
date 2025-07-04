'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import {
  BookOpen,
  FolderKanban,
  Video,
  Users,
  ArrowUpRight,
} from 'lucide-react'
import { useProgramContext } from '@/hooks/useProgressData'

interface AdminDashboardProps {
  onNavigate: (
    view:
      | 'dashboard'
      | 'programs'
      | 'modules'
      | 'videos'
      | 'users'
      | 'settings',
  ) => void
  setSidebarOpen: (open: boolean) => void
}

interface activityType {
  activity: string
  createdAt: number
  name: string
}

export function AdminDashboard({
  onNavigate,
  setSidebarOpen,
}: AdminDashboardProps) {
  const {
    programData,
    userCompletedVideos,
    allProgrammes,
    stats,
    recentActivity,
  } = useProgramContext()
  const recentFour = [...recentActivity] // keep state immutable
    .slice(-4) // last four
    .reverse()

  const statCards = [
    {
      id: 'programs',
      label: 'Total Programs',
      value: stats.programs,
      icon: BookOpen,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      id: 'modules',
      label: 'Total Modules',
      value: stats.modules,
      icon: FolderKanban,
      color: 'bg-green-50 text-green-600',
    },
    {
      id: 'videos',
      label: 'Total Videos',
      value: stats.videos,
      icon: Video,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      id: 'users',
      label: 'Active Users',
      value: stats.users,
      icon: Users,
      color: 'bg-orange-50 text-orange-600',
    },
  ]

  // const recentActivity = [
  //   {
  //     id: 1,
  //     action: "Added new module",
  //     target: "June - Alignment",
  //     user: "Admin",
  //     time: "2 hours ago",
  //   },
  //   {
  //     id: 2,
  //     action: "Updated video",
  //     target: "Welcome to Thrivemed Hub",
  //     user: "Admin",
  //     time: "5 hours ago",
  //   },
  //   {
  //     id: 3,
  //     action: "Added new program",
  //     target: "Thrivemed Apollo",
  //     user: "Admin",
  //     time: "1 day ago",
  //   },
  //   {
  //     id: 4,
  //     action: "Deleted video",
  //     target: "Outdated Content",
  //     user: "Admin",
  //     time: "2 days ago",
  //   },
  // ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Admin Dashboard
        </h1>
        <div className="text-sm text-gray-500">Last updated: May 22, 2025</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {statCards.map((stat) => (
          <Card
            key={stat.id}
            className="p-4 sm:p-6 shadow-sm border-0 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.label}
                </p>
                <p className="text-xl sm:text-2xl font-bold mt-1 text-gray-900">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`p-2 sm:p-3 rounded-full ${stat.color}`}>
                <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
            <Button
              variant="ghost"
              className="mt-3 sm:mt-4 p-0 h-auto text-blue-600 hover:text-blue-700 hover:bg-transparent"
              onClick={() => onNavigate(stat.id as any)}
            >
              <span className="text-sm">View all</span>
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-3 sm:gap-4">
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg justify-center lg:justify-start"
            onClick={() => onNavigate('programs')}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Add New Program
          </Button>
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg justify-center lg:justify-start"
            onClick={() => onNavigate('modules')}
          >
            <FolderKanban className="mr-2 h-4 w-4" />
            Add New Module
          </Button>
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg justify-center lg:justify-start"
            onClick={() => onNavigate('videos')}
          >
            <Video className="mr-2 h-4 w-4" />
            Add New Video
          </Button>
          <Button
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg justify-center lg:justify-start"
            onClick={() => onNavigate('users')}
          >
            <Users className="mr-2 h-4 w-4" />
            Manage Users
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-900">
          Recent Activity
        </h2>
        <Card className="shadow-sm border-0 rounded-xl overflow-hidden">
          <div className="divide-y">
            {recentFour.length ? (
              recentFour.map((activity: activityType, i: number) => (
                <div key={i} className="p-4 hover:bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {activity.activity}
                      </p>
                      <p className="text-sm text-gray-500">{activity.name}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-medium text-gray-900">Admin</p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(activity.createdAt, {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              /*  👇  placeholder shown when no items */
              <div className="p-6 text-center text-sm text-gray-500 italic">
                No recent activity yet. Try creating a program, module, or video
                to get things started!
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
