'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Registration {
  id: string
  name: string
  email: string
  age: number
  phone: string
  address: string
  student_type: string
  upi_id: string
  payment_method: string
  payment_status: string
  created_at: string
}

export default function AdminDashboardPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch registrations
        const response = await fetch('/api/registrations')
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Failed to fetch registrations')
          return
        }

        setRegistrations(data.data || [])
        setFilteredRegistrations(data.data || [])
      } catch (err) {
        setError('An error occurred. Please try again.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Set up real-time refresh - refresh every 5 seconds for live updates
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = async (query: string) => {
    setSearchQuery(query)

    if (!query.trim()) {
      setFilteredRegistrations(registrations)
      return
    }

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Search failed')
        return
      }

      setFilteredRegistrations(data.data || [])
    } catch (err) {
      setError('Search error occurred')
      console.error(err)
    }
  }

  const handleExportCSV = () => {
    if (filteredRegistrations.length === 0) {
      alert('No registrations to export')
      return
    }

    setExporting(true)

    try {
      const headers = ['Name', 'Email', 'Age', 'Phone', 'Student Type', 'Address', 'UPI ID', 'Payment Method', 'Payment Status', 'Registered On']
      const rows = filteredRegistrations.map(reg => [
        reg.name,
        reg.email,
        reg.age,
        reg.phone,
        reg.student_type,
        reg.address,
        reg.upi_id,
        reg.payment_method,
        reg.payment_status,
        new Date(reg.created_at).toLocaleString(),
      ])

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      ].join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `registrations_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } finally {
      setExporting(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const handleDeleteIndividual = async (id: string) => {
    if (!confirm('Are you sure you want to delete this registration? This action cannot be undone.')) return

    try {
      setDeleting(true)
      const { error: deleteError } = await supabase
        .from('registrations')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // Update local state
      setRegistrations(prev => prev.filter(r => r.id !== id))
      setFilteredRegistrations(prev => prev.filter(r => r.id !== id))
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id))
      alert('Registration deleted successfully')
    } catch (err: any) {
      console.error('Delete error:', err)
      alert('Failed to delete registration: ' + err.message)
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected registrations? This action cannot be undone.`)) return

    try {
      setDeleting(true)
      const { error: deleteError } = await supabase
        .from('registrations')
        .delete()
        .in('id', selectedIds)

      if (deleteError) throw deleteError

      // Update local state
      setRegistrations(prev => prev.filter(r => !selectedIds.includes(r.id)))
      setFilteredRegistrations(prev => prev.filter(r => !selectedIds.includes(r.id)))
      setSelectedIds([])
      alert('Selected registrations deleted successfully')
    } catch (err: any) {
      console.error('Bulk delete error:', err)
      alert('Failed to delete registrations: ' + err.message)
    } finally {
      setDeleting(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRegistrations.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredRegistrations.map(r => r.id))
    }
  }

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : [...prev, id]
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background to-secondary py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-secondary py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage registrations and quiz portal</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/quiz">
              <Button variant="outline" className="flex items-center gap-2">
                <span>📝</span> Quiz Portal
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="destructive">
              Logout
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{registrations.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">₹{registrations.length * 99}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">
                {registrations.filter(r => r.payment_status === 'pending').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Export */}
        <Card className="mb-8 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Registrations</CardTitle>
              <CardDescription>View and manage participant registrations</CardDescription>
            </div>
            {selectedIds.length > 0 && (
              <Button 
                onClick={handleDeleteSelected} 
                variant="destructive" 
                disabled={deleting}
                className="animate-in fade-in zoom-in duration-200"
              >
                Delete Selected ({selectedIds.length})
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 bg-background"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleExportCSV}
                  disabled={exporting}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                >
                  {exporting ? 'Exporting...' : 'Export CSV'}
                </Button>
              </div>
            </div>

            {error && (
              <Alert className="mb-6 bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-md border border-border">
              {filteredRegistrations.length === 0 ? (
                <div className="text-center py-12 bg-muted/20">
                  <p className="text-muted-foreground font-medium text-lg">No registrations found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your search query</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="w-[50px]">
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 rounded border-gray-300 accent-primary"
                          checked={selectedIds.length === filteredRegistrations.length && filteredRegistrations.length > 0}
                          onChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Student Type</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.map((reg) => (
                      <TableRow key={reg.id} className={selectedIds.includes(reg.id) ? 'bg-primary/5' : ''}>
                        <TableCell>
                          <input 
                            type="checkbox" 
                            className="h-4 w-4 rounded border-gray-300 accent-primary"
                            checked={selectedIds.includes(reg.id)}
                            onChange={() => toggleSelectOne(reg.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{reg.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{reg.email}</TableCell>
                        <TableCell className="text-sm font-mono">{reg.phone}</TableCell>
                        <TableCell className="text-xs uppercase font-semibold text-muted-foreground">{reg.student_type}</TableCell>
                        <TableCell className="text-xs uppercase font-semibold text-muted-foreground">{reg.payment_method}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              reg.payment_status === 'completed'
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : 'bg-amber-100 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {reg.payment_status}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(reg.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteIndividual(reg.id)}
                            disabled={deleting}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <span className="sr-only">Delete</span>
                            🗑️
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
