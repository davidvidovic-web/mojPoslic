'use client'

import { useState, useEffect } from 'react'
import { Briefcase, Users, TrendingUp } from 'lucide-react'

interface Stats {
  activeJobs: number
  employers: number
  totalUsers: number
  successRate: number
}

export function HeroStats() {
  const [stats, setStats] = useState<Stats>({
    activeJobs: 0,
    employers: 0,
    totalUsers: 0,
    successRate: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Keep default values on error
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  const AnimatedNumber = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
      if (loading) return

      const duration = 2000 // 2 seconds
      const steps = 60
      const increment = value / steps
      let current = 0

      const timer = setInterval(() => {
        current += increment
        if (current >= value) {
          setDisplayValue(value)
          clearInterval(timer)
        } else {
          setDisplayValue(Math.floor(current))
        }
      }, duration / steps)

      return () => clearInterval(timer)
    }, [value])

    if (loading) {
      return <div className="animate-pulse bg-muted rounded w-16 h-8"></div>
    }

    return (
      <span>
        {suffix === '%' ? `${displayValue}${suffix}` : `${formatNumber(displayValue)}${suffix}`}
      </span>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-xl bg-secondary">
          <Briefcase className="h-6 w-6 text-secondary-foreground" />
        </div>
        <div className="text-2xl font-bold">
          <AnimatedNumber value={stats.activeJobs} suffix="+" />
        </div>
        <div className="text-sm text-muted-foreground">Active Jobs</div>
      </div>
      
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-xl bg-accent">
          <Users className="h-6 w-6 text-accent-foreground" />
        </div>
        <div className="text-2xl font-bold">
          <AnimatedNumber value={stats.employers} suffix="+" />
        </div>
        <div className="text-sm text-muted-foreground">Employers</div>
      </div>
      
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center w-12 h-12 mx-auto rounded-xl bg-muted">
          <TrendingUp className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="text-2xl font-bold">
          <AnimatedNumber value={stats.totalUsers} suffix="+" />
        </div>
        <div className="text-sm text-muted-foreground">Registered Users</div>
      </div>
    </div>
  )
}
