"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Edit, Trash2, Copy, MessageSquare, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

interface MessageTemplate {
  id: string
  name: string
  subject: string
  content: string
  category: 'application_received' | 'application_reviewed' | 'shortlisted' | 'selected' | 'rejected' | 'interview_invite' | 'follow_up' | 'custom'
  isDefault: boolean
  variables: string[]
  createdAt: Date
  updatedAt: Date
}

interface MessageTemplatesProps {
  onSelectTemplate: (template: MessageTemplate) => void
  onSendMessage?: (templateId: string, recipientIds: string[], customizations?: Record<string, string>) => void
}

const defaultTemplates: MessageTemplate[] = [
  {
    id: '1',
    name: 'Application Received',
    subject: 'Thank you for your application - {{jobTitle}}',
    content: `Dear {{applicantName}},

Thank you for applying for the {{jobTitle}} position at {{companyName}}. We have received your application and will review it carefully.

We will get back to you within {{reviewTimeframe}} with an update on your application status.

Best regards,
{{companyName}} Team`,
    category: 'application_received',
    isDefault: true,
    variables: ['applicantName', 'jobTitle', 'companyName', 'reviewTimeframe'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Shortlisted Candidate',
    subject: 'Great news! You\'ve been shortlisted for {{jobTitle}}',
    content: `Dear {{applicantName}},

Congratulations! We are pleased to inform you that you have been shortlisted for the {{jobTitle}} position.

We were impressed by your {{highlightedSkills}} and believe you would be a great fit for our team.

Next steps:
- We will contact you within {{contactTimeframe}} to schedule an interview
- Please keep your calendar flexible for the next week
- Feel free to reach out if you have any questions

We look forward to speaking with you soon!

Best regards,
{{recruiterName}}
{{companyName}}`,
    category: 'shortlisted',
    isDefault: true,
    variables: ['applicantName', 'jobTitle', 'highlightedSkills', 'contactTimeframe', 'recruiterName', 'companyName'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'Job Offer',
    subject: 'Job Offer - {{jobTitle}} at {{companyName}}',
    content: `Dear {{applicantName}},

We are delighted to offer you the position of {{jobTitle}} at {{companyName}}.

Offer Details:
- Position: {{jobTitle}}
- Start Date: {{startDate}}
- Salary: {{salaryOffer}}
- Location: {{jobLocation}}

Please review the attached contract and let us know your decision by {{responseDeadline}}.

We are excited about the possibility of you joining our team!

Best regards,
{{recruiterName}}
{{companyName}}`,
    category: 'selected',
    isDefault: true,
    variables: ['applicantName', 'jobTitle', 'companyName', 'startDate', 'salaryOffer', 'jobLocation', 'responseDeadline', 'recruiterName'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    name: 'Application Rejection',
    subject: 'Update on your application for {{jobTitle}}',
    content: `Dear {{applicantName}},

Thank you for your interest in the {{jobTitle}} position at {{companyName}} and for taking the time to apply.

After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.

We appreciate the time and effort you put into your application. Your background is impressive, and we encourage you to apply for future opportunities that may be a better fit.

We wish you the best of luck in your job search.

Best regards,
{{recruiterName}}
{{companyName}}`,
    category: 'rejected',
    isDefault: true,
    variables: ['applicantName', 'jobTitle', 'companyName', 'recruiterName'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const categoryColors = {
  application_received: 'bg-blue-100 text-blue-800',
  application_reviewed: 'bg-yellow-100 text-yellow-800',
  shortlisted: 'bg-purple-100 text-purple-800',
  selected: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  interview_invite: 'bg-indigo-100 text-indigo-800',
  follow_up: 'bg-orange-100 text-orange-800',
  custom: 'bg-gray-100 text-gray-800'
}

export function MessageTemplates({ onSelectTemplate }: Omit<MessageTemplatesProps, 'onSendMessage'>) {
  const t = useTranslations('messageTemplates')

  const categoryLabels = {
    application_received: t('categories.application_received'),
    application_reviewed: t('categories.application_reviewed'),
    shortlisted: t('categories.shortlisted'),
    selected: t('categories.selected'),
    rejected: t('categories.rejected'),
    interview_invite: t('categories.interview_invite'),
    follow_up: t('categories.follow_up'),
    custom: t('categories.custom')
  }
  const [templates, setTemplates] = useState<MessageTemplate[]>(defaultTemplates)
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Form state for creating/editing templates
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'custom' as MessageTemplate['category']
  })

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleCreateTemplate = () => {
    const newTemplate: MessageTemplate = {
      id: Date.now().toString(),
      name: formData.name,
      subject: formData.subject,
      content: formData.content,
      category: formData.category,
      isDefault: false,
      variables: extractVariables(formData.content + ' ' + formData.subject),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setTemplates([...templates, newTemplate])
    setIsCreateModalOpen(false)
    resetForm()
    toast.success(t('success.created'))
  }

  const handleEditTemplate = () => {
    if (!selectedTemplate) return

    const updatedTemplate = {
      ...selectedTemplate,
      name: formData.name,
      subject: formData.subject,
      content: formData.content,
      category: formData.category,
      variables: extractVariables(formData.content + ' ' + formData.subject),
      updatedAt: new Date()
    }

    setTemplates(templates.map(t => t.id === selectedTemplate.id ? updatedTemplate : t))
    setIsEditModalOpen(false)
    setSelectedTemplate(null)
    resetForm()
    toast.success(t('success.updated'))
  }

  const handleDeleteTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template?.isDefault) {
      toast.error(t('errors.cannotDeleteDefault'))
      return
    }

    setTemplates(templates.filter(t => t.id !== templateId))
    toast.success(t('success.deleted'))
  }

  const handleCopyTemplate = (template: MessageTemplate) => {
    navigator.clipboard.writeText(`Subject: ${template.subject}\n\n${template.content}`)
    toast.success(t('success.copied'))
  }

  const openEditModal = (template: MessageTemplate) => {
    setSelectedTemplate(template)
    setFormData({
      name: template.name,
      subject: template.subject,
      content: template.content,
      category: template.category
    })
    setIsEditModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      content: '',
      category: 'custom'
    })
  }

  const extractVariables = (text: string): string[] => {
    const variableRegex = /\{\{(\w+)\}\}/g
    const matches = text.match(variableRegex) || []
    return [...new Set(matches.map(match => match.replace(/[{}]/g, '')))]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('title')}</h2>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('createTemplate')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('createTemplateTitle')}</DialogTitle>
              <DialogDescription>
                {t('createTemplateDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">{t('templateName')}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('templateNamePlaceholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="category">{t('category')}</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as MessageTemplate['category'] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="subject">{t('subjectLine')}</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder={t('subjectLinePlaceholder')}
                />
              </div>
              <div>
                <Label htmlFor="content">{t('messageContent')}</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={t('messageContentPlaceholder')}
                  className="min-h-[200px]"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button onClick={handleCreateTemplate} disabled={!formData.name || !formData.content}>
                  {t('create')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t('filterByCategory')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allCategories')}</SelectItem>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge className={categoryColors[template.category]} variant="secondary">
                    {categoryLabels[template.category]}
                  </Badge>
                </div>
                {template.isDefault && (
                  <Badge variant="outline" className="text-xs">
                    {t('default')}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('subject')}</p>
                <p className="text-sm">{template.subject}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('preview')}</p>
                <ScrollArea className="h-20">
                  <p className="text-sm text-muted-foreground">
                    {template.content.substring(0, 150)}
                    {template.content.length > 150 && '...'}
                  </p>
                </ScrollArea>
              </div>

              {template.variables.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">{t('variables')}</p>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.slice(0, 3).map((variable) => (
                      <Badge key={variable} variant="outline" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                    {template.variables.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.variables.length - 3} {t('more')}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <Separator />

              {/* Actions */}
              <div className="flex justify-between">
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelectTemplate(template)}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyTemplate(template)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex space-x-1">
                  {!template.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">{t('noTemplatesFound')}</h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedCategory !== 'all' 
              ? t('noTemplatesFoundDesc')
              : t('createFirstTemplate')
            }
          </p>
        </div>
      )}

      {/* Edit Template Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('editTemplateTitle')}</DialogTitle>
            <DialogDescription>
              {t('editTemplateDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">{t('templateName')}</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">{t('category')}</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as MessageTemplate['category'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-subject">{t('subjectLine')}</Label>
              <Input
                id="edit-subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-content">{t('messageContent')}</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="min-h-[200px]"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                {t('cancel')}
              </Button>
              <Button onClick={handleEditTemplate} disabled={!formData.name || !formData.content}>
                {t('update')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
