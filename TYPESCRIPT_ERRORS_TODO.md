npx tsc --noEmit
src/components/dashboard/tasker/application-tracker.tsx:316:49 - error TS2345: Argument of type '"PENDING" | "SELECTED" | "REJECTED" | "REVIEWED" | "SHORTLISTED" | "WITHDRAWN"' is not assignable to parameter of type 'ApplicationStatus'.
  Type '"PENDING"' is not assignable to type 'ApplicationStatus'.

316                                 {getStatusBadge(application.status)}
                                                    ~~~~~~~~~~~~~~~~~~

src/components/dashboard/tasker/applied-jobs-section.tsx:156:15 - error TS2367: This comparison appears to be unintentional because the types '"PENDING" | "SELECTED" | "REJECTED" | "WITHDRAWN"' and '"SHORTLISTED"' have no overlap.

156             {(application.status === 'SHORTLISTED' || application.status === 'SELECTED') && (
                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/components/dashboard/tasker/job-applications-manager.tsx:22:51 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(predicate: (value: { applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; ... 32 more ...; user: { ...; }; }, index: number, array: { ...; }[]) => value is { ...; }, thisArg?: any): { ...; }[]', gave the following error.
    Argument of type '(app: JobApplication) => boolean' is not assignable to parameter of type '(value: { applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; availability: string; ... 31 more ...; user: { ...; }; }, index: number, array: { ...; }[]) => value is { ...; }'.
      Types of parameters 'app' and 'value' are incompatible.
        Type '{ applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; availability: string; ... 31 more ...; user: { ...; }; }' is not assignable to type 'JobApplication'.
          Types of property 'status' are incompatible.
            Type '"PENDING" | "REVIEWED" | "SHORTLISTED" | "SELECTED" | "REJECTED" | "WITHDRAWN"' is not assignable to type 'ApplicationStatus'.
              Type '"PENDING"' is not assignable to type 'ApplicationStatus'.
  Overload 2 of 2, '(predicate: (value: { applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; ... 32 more ...; user: { ...; }; }, index: number, array: { ...; }[]) => unknown, thisArg?: any): { ...; }[]', gave the following error.
    Argument of type '(app: JobApplication) => boolean' is not assignable to parameter of type '(value: { applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; availability: string; ... 31 more ...; user: { ...; }; }, index: number, array: { ...; }[]) => unknown'.
      Types of parameters 'app' and 'value' are incompatible.
        Type '{ applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; availability: string; ... 31 more ...; user: { ...; }; }' is not assignable to type 'JobApplication'.
          Types of property 'status' are incompatible.
            Type '"PENDING" | "REVIEWED" | "SHORTLISTED" | "SELECTED" | "REJECTED" | "WITHDRAWN"' is not assignable to type 'ApplicationStatus'.
              Type '"PENDING"' is not assignable to type 'ApplicationStatus'.

22   const pendingApplications = applications.filter((app: JobApplication) => app.status === ApplicationStatus.PENDING)
                                                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


src/components/dashboard/tasker/job-applications-manager.tsx:23:52 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(predicate: (value: { applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; ... 32 more ...; user: { ...; }; }, index: number, array: { ...; }[]) => value is { ...; }, thisArg?: any): { ...; }[]', gave the following error.
    Argument of type '(app: JobApplication) => boolean' is not assignable to parameter of type '(value: { applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; availability: string; ... 31 more ...; user: { ...; }; }, index: number, array: { ...; }[]) => value is { ...; }'.
      Types of parameters 'app' and 'value' are incompatible.
        Type '{ applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; availability: string; ... 31 more ...; user: { ...; }; }' is not assignable to type 'JobApplication'.
          Types of property 'status' are incompatible.
            Type '"PENDING" | "REVIEWED" | "SHORTLISTED" | "SELECTED" | "REJECTED" | "WITHDRAWN"' is not assignable to type 'ApplicationStatus'.
              Type '"PENDING"' is not assignable to type 'ApplicationStatus'.
  Overload 2 of 2, '(predicate: (value: { applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; ... 32 more ...; user: { ...; }; }, index: number, array: { ...; }[]) => unknown, thisArg?: any): { ...; }[]', gave the following error.
    Argument of type '(app: JobApplication) => boolean' is not assignable to parameter of type '(value: { applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; availability: string; ... 31 more ...; user: { ...; }; }, index: number, array: { ...; }[]) => unknown'.
      Types of parameters 'app' and 'value' are incompatible.
        Type '{ applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; availability: string; ... 31 more ...; user: { ...; }; }' is not assignable to type 'JobApplication'.
          Types of property 'status' are incompatible.
            Type '"PENDING" | "REVIEWED" | "SHORTLISTED" | "SELECTED" | "REJECTED" | "WITHDRAWN"' is not assignable to type 'ApplicationStatus'.
              Type '"PENDING"' is not assignable to type 'ApplicationStatus'.

23   const reviewedApplications = applications.filter((app: JobApplication) =>
                                                      ~~~~~~~~~~~~~~~~~~~~~~~~
24     app.status === ApplicationStatus.REVIEWED ||
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
25     app.status === ApplicationStatus.SHORTLISTED ||
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
26     app.status === ApplicationStatus.SELECTED
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


src/components/dashboard/tasker/job-applications-manager.tsx:109:42 - error TS2345: Argument of type '(application: JobApplication) => JSX.Element' is not assignable to parameter of type '(value: { applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; availability: string; ... 31 more ...; user: { ...; }; }, index: number, array: { ...; }[]) => Element'.
  Types of parameters 'application' and 'value' are incompatible.
    Type '{ applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; availability: string; ... 31 more ...; user: { ...; }; }' is not assignable to type 'JobApplication'.
      Types of property 'status' are incompatible.
        Type '"PENDING" | "REVIEWED" | "SHORTLISTED" | "SELECTED" | "REJECTED" | "WITHDRAWN"' is not assignable to type 'ApplicationStatus'.
          Type '"PENDING"' is not assignable to type 'ApplicationStatus'.

109                 {pendingApplications.map((application: JobApplication) => (
                                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
110                   <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
... 
140                   </div>
    ~~~~~~~~~~~~~~~~~~~~~~~~
141                 ))}
    ~~~~~~~~~~~~~~~~~

src/components/dashboard/tasker/job-applications-manager.tsx:160:43 - error TS2345: Argument of type '(application: JobApplication) => JSX.Element' is not assignable to parameter of type '(value: { applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; availability: string; ... 31 more ...; user: { ...; }; }, index: number, array: { ...; }[]) => Element'.
  Types of parameters 'application' and 'value' are incompatible.
    Type '{ applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; availability: string; ... 31 more ...; user: { ...; }; }' is not assignable to type 'JobApplication'.
      Types of property 'status' are incompatible.
        Type '"PENDING" | "REVIEWED" | "SHORTLISTED" | "SELECTED" | "REJECTED" | "WITHDRAWN"' is not assignable to type 'ApplicationStatus'.
          Type '"PENDING"' is not assignable to type 'ApplicationStatus'.

160                 {reviewedApplications.map((application: JobApplication) => (
                                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
161                   <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
... 
191                   </div>
    ~~~~~~~~~~~~~~~~~~~~~~~~
192                 ))}
    ~~~~~~~~~~~~~~~~~

src/components/dashboard/tasker/shortlisted-jobs-section.tsx:49:5 - error TS2367: This comparison appears to be unintentional because the types '"PENDING" | "SELECTED" | "REJECTED" | "WITHDRAWN"' and '"SHORTLISTED"' have no overlap.

49     app.status === 'SHORTLISTED' || app.status === 'INTERVIEW_SCHEDULED'
       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/components/dashboard/tasker/shortlisted-jobs-section.tsx:49:37 - error TS2367: This comparison appears to be unintentional because the types '"PENDING" | "SELECTED" | "REJECTED" | "WITHDRAWN"' and '"INTERVIEW_SCHEDULED"' have no overlap.

49     app.status === 'SHORTLISTED' || app.status === 'INTERVIEW_SCHEDULED'
                                       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/components/dashboard/tasker/shortlisted-jobs-section.tsx:106:13 - error TS2551: Property 'salary_min' does not exist on type 'Job'. Did you mean 'salaryMin'?

106     if (job.salary_min && job.salary_max) {
                ~~~~~~~~~~

  src/components/dashboard/tasker/shortlisted-jobs-section.tsx:19:3
    19   salaryMin?: number
         ~~~~~~~~~
    'salaryMin' is declared here.

src/components/dashboard/tasker/shortlisted-jobs-section.tsx:106:31 - error TS2551: Property 'salary_max' does not exist on type 'Job'. Did you mean 'salaryMax'?

106     if (job.salary_min && job.salary_max) {
                                  ~~~~~~~~~~

  src/components/dashboard/tasker/shortlisted-jobs-section.tsx:20:3
    20   salaryMax?: number
         ~~~~~~~~~
    'salaryMax' is declared here.

src/components/dashboard/tasker/shortlisted-jobs-section.tsx:107:22 - error TS2551: Property 'salary_min' does not exist on type 'Job'. Did you mean 'salaryMin'?

107       return `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                         ~~~~~~~~~~

  src/components/dashboard/tasker/shortlisted-jobs-section.tsx:19:3
    19   salaryMin?: number
         ~~~~~~~~~
    'salaryMin' is declared here.

src/components/dashboard/tasker/shortlisted-jobs-section.tsx:107:60 - error TS2551: Property 'salary_max' does not exist on type 'Job'. Did you mean 'salaryMax'?

107       return `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                                                               ~~~~~~~~~~

  src/components/dashboard/tasker/shortlisted-jobs-section.tsx:20:3
    20   salaryMax?: number
         ~~~~~~~~~
    'salaryMax' is declared here.

src/components/dashboard/tasker/tasker-stats-cards.tsx:30:49 - error TS2367: This comparison appears to be unintentional because the types '"completed" | "pending" | "rejected" | "accepted" | "reviewed"' and '"SELECTED"' have no overlap.

30   const activeJobs = applications.filter(app => app.status === 'SELECTED').length
                                                   ~~~~~~~~~~~~~~~~~~~~~~~~~

src/components/jobs/job-post-form.tsx:33:59 - error TS2345: Argument of type '{ title: string; description: string; requirements: string; benefits: string; type: "quick_job"; city_id: string; category_id: string; salary: string; salaryType: undefined; salaryMin: undefined; ... 8 more ...; job_longitude: undefined; }' is not assignable to parameter of type 'CreateJobData | (() => CreateJobData)'.
  Property 'job_type' is missing in type '{ title: string; description: string; requirements: string; benefits: string; type: "quick_job"; city_id: string; category_id: string; salary: string; salaryType: undefined; salaryMin: undefined; ... 8 more ...; job_longitude: undefined; }' but required in type 'CreateJobData'.

 33   const [formData, setFormData] = useState<CreateJobData>({
                                                              ~
 34     title: '',
    ~~~~~~~~~~~~~~
... 
 52     job_longitude: undefined
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 53   })
    ~~~

  src/types/job.ts:150:3
    150   job_type: 'quick_job' | 'full_time' | 'part_time' | 'remote'
          ~~~~~~~~
    'job_type' is declared here.

src/components/jobs/job-post-form.tsx:80:35 - error TS2345: Argument of type 'StaticCategory[]' is not assignable to parameter of type 'SetStateAction<Category[]>'.
  Type 'StaticCategory[]' is not assignable to type 'Category[]'.
    Type 'StaticCategory' is not assignable to type 'Category'.
      Property 'sort_order' is optional in type 'StaticCategory' but required in type 'Category'.

80       setAvailableChildCategories(parentCategory?.children || [])
                                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/components/jobs/job-post-form.tsx:178:21 - error TS2345: Argument of type '{ title: string; description: string; requirements: string; benefits: string; type: "quick_job"; city_id: string; category_id: string; salary: string; salaryType: undefined; salaryMin: undefined; ... 8 more ...; job_longitude: undefined; }' is not assignable to parameter of type 'SetStateAction<CreateJobData>'.
  Property 'job_type' is missing in type '{ title: string; description: string; requirements: string; benefits: string; type: "quick_job"; city_id: string; category_id: string; salary: string; salaryType: undefined; salaryMin: undefined; ... 8 more ...; job_longitude: undefined; }' but required in type 'CreateJobData'.

178         setFormData({
                        ~
179           title: '',
    ~~~~~~~~~~~~~~~~~~~~
... 
197           job_longitude: undefined
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
198         })
    ~~~~~~~~~

  src/types/job.ts:150:3
    150   job_type: 'quick_job' | 'full_time' | 'part_time' | 'remote'
          ~~~~~~~~
    'job_type' is declared here.

src/components/jobs/job-post-form/job-cost-info.tsx:24:44 - error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.

24     willCostConnections: getJobPostingCost(todayCount) > 0,
                                              ~~~~~~~~~~

src/components/jobs/job-post-form/job-cost-info.tsx:25:39 - error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.

25     connectionCost: getJobPostingCost(todayCount)
                                         ~~~~~~~~~~

src/components/jobs/job-post-form/review-step.tsx:70:15 - error TS2345: Argument of type 'StaticCity' is not assignable to parameter of type 'SetStateAction<City>'.
  Property 'state' is missing in type 'StaticCity' but required in type 'City'.

70       setCity(foundCity || null)
                 ~~~~~~~~~~~~~~~~~

  src/lib/static-data-types.ts:13:3
    13   state: string
         ~~~~~
    'state' is declared here.

src/components/jobs/job-post-form/use-job-form-state.ts:268:17 - error TS2345: Argument of type '{ title: string; city_id: string; category_id: string; type: "quick_job" | "full_time" | "part_time" | "remote"; description: string; requirements: string; benefits: string; salary: string; ... 15 more ...; tags: any[]; }' is not assignable to parameter of type 'SetStateAction<CreateJobData>'.
  Property 'job_type' is missing in type '{ title: string; city_id: string; category_id: string; type: "quick_job" | "full_time" | "part_time" | "remote"; description: string; requirements: string; benefits: string; salary: string; ... 15 more ...; tags: any[]; }' but required in type 'CreateJobData'.

268     setFormData(defaultData)
                    ~~~~~~~~~~~

  src/types/job.ts:150:3
    150   job_type: 'quick_job' | 'full_time' | 'part_time' | 'remote'
          ~~~~~~~~
    'job_type' is declared here.

src/components/jobs/job/job-application-sidebar.tsx:42:21 - error TS2339: Property 'role' does not exist on type '{ name?: string; email?: string; id?: string; }'.

42           ) : user?.role === 'client' ? (
                       ~~~~

src/hooks/queries/useApplications.ts:13:51 - error TS2345: Argument of type 'string' is not assignable to parameter of type 'ApplicationFilters'.

13     queryKey: jobId ? queryKeys.jobs.applications(jobId) : queryKeys.applications.all,
                                                     ~~~~~

src/hooks/queries/useApplications.ts:71:10 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(values: { applicant_avatar_url?: string; applicant_email: string; applicant_location?: string; applicant_name: string; applicant_phone?: string; applicant_rating?: number; applied_at?: string; availability?: string; ... 29 more ...; user_id?: string; }, options?: { ...; }): PostgrestFilterBuilder<...>', gave the following error.
    Argument of type '{ applied_at?: string; availability?: string; client_notes?: string; contact_info?: string; cover_letter?: string; estimated_duration?: string; hourly_rate?: number; id?: string; job_id?: string; questions_answers?: Json; resume_url?: string; status?: "PENDING" | ... 4 more ... | "WITHDRAWN"; updated_at?: string; us...' is not assignable to parameter of type '{ applicant_avatar_url?: string; applicant_email: string; applicant_location?: string; applicant_name: string; applicant_phone?: string; applicant_rating?: number; applied_at?: string; availability?: string; ... 29 more ...; user_id?: string; }'.
      Type '{ applied_at?: string; availability?: string; client_notes?: string; contact_info?: string; cover_letter?: string; estimated_duration?: string; hourly_rate?: number; id?: string; job_id?: string; questions_answers?: Json; resume_url?: string; status?: "PENDING" | ... 4 more ... | "WITHDRAWN"; updated_at?: string; us...' is missing the following properties from type '{ applicant_avatar_url?: string; applicant_email: string; applicant_location?: string; applicant_name: string; applicant_phone?: string; applicant_rating?: number; applied_at?: string; availability?: string; ... 29 more ...; user_id?: string; }': applicant_email, applicant_name, job_category_name, job_city_name, and 3 more.
  Overload 2 of 2, '(values: { applicant_avatar_url?: string; applicant_email: string; applicant_location?: string; applicant_name: string; applicant_phone?: string; applicant_rating?: number; applied_at?: string; availability?: string; ... 29 more ...; user_id?: string; }[], options?: { ...; }): PostgrestFilterBuilder<...>', gave the following error.
    Type '{ applied_at?: string; availability?: string; client_notes?: string; contact_info?: string; cover_letter?: string; estimated_duration?: string; hourly_rate?: number; id?: string; job_id?: string; questions_answers?: Json; resume_url?: string; status?: "PENDING" | ... 4 more ... | "WITHDRAWN"; updated_at?: string; us...' is missing the following properties from type '{ applicant_avatar_url?: string; applicant_email: string; applicant_location?: string; applicant_name: string; applicant_phone?: string; applicant_rating?: number; applied_at?: string; availability?: string; ... 29 more ...; user_id?: string; }': applicant_email, applicant_name, job_category_name, job_city_name, and 3 more.

71         .insert([applicationData])
            ~~~~~~


src/hooks/queries/useApplications.ts:86:49 - error TS2345: Argument of type 'string' is not assignable to parameter of type 'ApplicationFilters'.

86           queryKey: queryKeys.jobs.applications(newApplication.job_id)
                                                   ~~~~~~~~~~~~~~~~~~~~~

src/hooks/queries/useApplications.ts:130:49 - error TS2345: Argument of type 'string' is not assignable to parameter of type 'ApplicationFilters'.

130           queryKey: queryKeys.jobs.applications(updatedApplication.job_id)
                                                    ~~~~~~~~~~~~~~~~~~~~~~~~~

src/hooks/queries/useApplications.ts:174:51 - error TS2345: Argument of type 'string' is not assignable to parameter of type 'ApplicationFilters'.

174             queryKey: queryKeys.jobs.applications(jobId)
                                                      ~~~~~

src/hooks/queries/useStaticData.ts:15:37 - error TS2589: Type instantiation is excessively deep and possibly infinite.

15       const { data, error } = await supabase
                                       ~~~~~~~~
16         .from('cities')
   ~~~~~~~~~~~~~~~~~~~~~~~
17         .select('*')
   ~~~~~~~~~~~~~~~~~~~~
18         .eq('is_active', true)
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/hooks/queries/useStaticData.ts:16:15 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(relation: "account_deletion_requests" | "users" | "analytics_events" | "applications" | "job_listings" | "connection_history" | "conversations" | "file_uploads" | "job_assignments" | ... 8 more ... | "user_activity_summary"): PostgrestQueryBuilder<...>', gave the following error.
    Argument of type '"cities"' is not assignable to parameter of type '"account_deletion_requests" | "users" | "analytics_events" | "applications" | "job_listings" | "connection_history" | "conversations" | "file_uploads" | "job_assignments" | ... 8 more ... | "user_activity_summary"'.
  Overload 2 of 2, '(relation: "top_performers" | "popular_jobs"): PostgrestQueryBuilder<{ Tables: { account_deletion_requests: { Row: { id: string; processed_at: string; processed_by_id: string; reason: string; requested_at: string; user_id: string; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 16 more ...; users: { ...; }; }; Views: { ...; }; Functions: { ...; }; Enums: { ...; }; CompositeTypes: { ...; }; }, { ...; } | { ...; }, "top_performers" | "popular_jobs", [] | [...]>', gave the following error.
    Argument of type '"cities"' is not assignable to parameter of type '"top_performers" | "popular_jobs"'.

16         .from('cities')
                 ~~~~~~~~


src/hooks/queries/useStaticData.ts:25:7 - error TS2322: Type '({ applications_received: number; applications_sent: number; avatar_url: string; average_rating: number; bio: string; company_name: string; connections: number; connections_last_refresh: string; ... 38 more ...; website: string; } | ... 16 more ... | { ...; })[]' is not assignable to type '{ country: string; created_at: string; id: string; is_active: boolean; is_special: boolean; key: string; latitude: number; longitude: number; name: string; }[]'.
  Type '{ applications_received: number; applications_sent: number; avatar_url: string; average_rating: number; bio: string; company_name: string; connections: number; connections_last_refresh: string; ... 38 more ...; website: string; } | ... 16 more ... | { ...; }' is not assignable to type '{ country: string; created_at: string; id: string; is_active: boolean; is_special: boolean; key: string; latitude: number; longitude: number; name: string; }'.
    Type '{ applications_received: number; applications_sent: number; avatar_url: string; average_rating: number; bio: string; company_name: string; connections: number; connections_last_refresh: string; ... 38 more ...; website: string; }' is missing the following properties from type '{ country: string; created_at: string; id: string; is_active: boolean; is_special: boolean; key: string; latitude: number; longitude: number; name: string; }': country, is_active, is_special, key, and 2 more.

25       return data || []
         ~~~~~~

src/hooks/queries/useStaticData.ts:43:15 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(relation: "account_deletion_requests" | "users" | "analytics_events" | "applications" | "job_listings" | "connection_history" | "conversations" | "file_uploads" | "job_assignments" | ... 8 more ... | "user_activity_summary"): PostgrestQueryBuilder<...>', gave the following error.
    Argument of type '"categories"' is not assignable to parameter of type '"account_deletion_requests" | "users" | "analytics_events" | "applications" | "job_listings" | "connection_history" | "conversations" | "file_uploads" | "job_assignments" | ... 8 more ... | "user_activity_summary"'.
  Overload 2 of 2, '(relation: "top_performers" | "popular_jobs"): PostgrestQueryBuilder<{ Tables: { account_deletion_requests: { Row: { id: string; processed_at: string; processed_by_id: string; reason: string; requested_at: string; user_id: string; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 16 more ...; users: { ...; }; }; Views: { ...; }; Functions: { ...; }; Enums: { ...; }; CompositeTypes: { ...; }; }, { ...; } | { ...; }, "top_performers" | "popular_jobs", [] | [...]>', gave the following error.
    Argument of type '"categories"' is not assignable to parameter of type '"top_performers" | "popular_jobs"'.

43         .from('categories')
                 ~~~~~~~~~~~~


src/hooks/queries/useStaticData.ts:68:37 - error TS2589: Type instantiation is excessively deep and possibly infinite.

68       const { data, error } = await supabase
                                       ~~~~~~~~
69         .from('categories')
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~
70         .select('*')
   ~~~~~~~~~~~~~~~~~~~~
71         .eq('is_popular', true)
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/hooks/queries/useStaticData.ts:69:15 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(relation: "account_deletion_requests" | "users" | "analytics_events" | "applications" | "job_listings" | "connection_history" | "conversations" | "file_uploads" | "job_assignments" | ... 8 more ... | "user_activity_summary"): PostgrestQueryBuilder<...>', gave the following error.
    Argument of type '"categories"' is not assignable to parameter of type '"account_deletion_requests" | "users" | "analytics_events" | "applications" | "job_listings" | "connection_history" | "conversations" | "file_uploads" | "job_assignments" | ... 8 more ... | "user_activity_summary"'.
  Overload 2 of 2, '(relation: "top_performers" | "popular_jobs"): PostgrestQueryBuilder<{ Tables: { account_deletion_requests: { Row: { id: string; processed_at: string; processed_by_id: string; reason: string; requested_at: string; user_id: string; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 16 more ...; users: { ...; }; }; Views: { ...; }; Functions: { ...; }; Enums: { ...; }; CompositeTypes: { ...; }; }, { ...; } | { ...; }, "top_performers" | "popular_jobs", [] | [...]>', gave the following error.
    Argument of type '"categories"' is not assignable to parameter of type '"top_performers" | "popular_jobs"'.

69         .from('categories')
                 ~~~~~~~~~~~~


src/hooks/use-ai-job-matching.ts:118:10 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(values: { bookmark_type?: string; created_at?: string; id?: string; job_category_name: string; job_city_name: string; job_id?: string; job_posted_at: string; job_salary_max?: number; job_salary_min?: number; ... 4 more ...; user_id?: string; }, options?: { ...; }): PostgrestFilterBuilder<...>', gave the following error.
    Argument of type '{ user_id: string; job_id: string; }' is not assignable to parameter of type '{ bookmark_type?: string; created_at?: string; id?: string; job_category_name: string; job_city_name: string; job_id?: string; job_posted_at: string; job_salary_max?: number; job_salary_min?: number; ... 4 more ...; user_id?: string; }'.
      Type '{ user_id: string; job_id: string; }' is missing the following properties from type '{ bookmark_type?: string; created_at?: string; id?: string; job_category_name: string; job_city_name: string; job_id?: string; job_posted_at: string; job_salary_max?: number; job_salary_min?: number; ... 4 more ...; user_id?: string; }': job_category_name, job_city_name, job_posted_at, job_status, job_title
  Overload 2 of 2, '(values: { bookmark_type?: string; created_at?: string; id?: string; job_category_name: string; job_city_name: string; job_id?: string; job_posted_at: string; job_salary_max?: number; job_salary_min?: number; ... 4 more ...; user_id?: string; }[], options?: { ...; }): PostgrestFilterBuilder<...>', gave the following error.
    Object literal may only specify known properties, and 'user_id' does not exist in type '{ bookmark_type?: string; created_at?: string; id?: string; job_category_name: string; job_city_name: string; job_id?: string; job_posted_at: string; job_salary_max?: number; job_salary_min?: number; ... 4 more ...; user_id?: string; }[]'.

118         .upsert({
             ~~~~~~


src/hooks/use-ai-job-matching.ts:148:10 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(values: { applicant_avatar_url?: string; applicant_email: string; applicant_location?: string; applicant_name: string; applicant_phone?: string; applicant_rating?: number; applied_at?: string; availability?: string; ... 29 more ...; user_id?: string; }, options?: { ...; }): PostgrestFilterBuilder<...>', gave the following error.
    Argument of type '{ job_id: string; user_id: string; cover_letter: string; hourly_rate: number; estimated_duration: string; }' is not assignable to parameter of type '{ applicant_avatar_url?: string; applicant_email: string; applicant_location?: string; applicant_name: string; applicant_phone?: string; applicant_rating?: number; applied_at?: string; availability?: string; ... 29 more ...; user_id?: string; }'.
      Type '{ job_id: string; user_id: string; cover_letter: string; hourly_rate: number; estimated_duration: string; }' is missing the following properties from type '{ applicant_avatar_url?: string; applicant_email: string; applicant_location?: string; applicant_name: string; applicant_phone?: string; applicant_rating?: number; applied_at?: string; availability?: string; ... 29 more ...; user_id?: string; }': applicant_email, applicant_name, job_category_name, job_city_name, and 3 more.
  Overload 2 of 2, '(values: { applicant_avatar_url?: string; applicant_email: string; applicant_location?: string; applicant_name: string; applicant_phone?: string; applicant_rating?: number; applied_at?: string; availability?: string; ... 29 more ...; user_id?: string; }[], options?: { ...; }): PostgrestFilterBuilder<...>', gave the following error.
    Object literal may only specify known properties, and 'job_id' does not exist in type '{ applicant_avatar_url?: string; applicant_email: string; applicant_location?: string; applicant_name: string; applicant_phone?: string; applicant_rating?: number; applied_at?: string; availability?: string; ... 29 more ...; user_id?: string; }[]'.

148         .insert({
             ~~~~~~


src/hooks/use-ai-job-matching.ts:181:15 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(relation: "account_deletion_requests" | "users" | "analytics_events" | "applications" | "job_listings" | "connection_history" | "conversations" | "file_uploads" | "job_assignments" | ... 8 more ... | "user_activity_summary"): PostgrestQueryBuilder<...>', gave the following error.
    Argument of type '"job_views"' is not assignable to parameter of type '"account_deletion_requests" | "users" | "analytics_events" | "applications" | "job_listings" | "connection_history" | "conversations" | "file_uploads" | "job_assignments" | ... 8 more ... | "user_activity_summary"'.
  Overload 2 of 2, '(relation: "top_performers" | "popular_jobs"): PostgrestQueryBuilder<{ Tables: { account_deletion_requests: { Row: { id: string; processed_at: string; processed_by_id: string; reason: string; requested_at: string; user_id: string; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 16 more ...; users: { ...; }; }; Views: { ...; }; Functions: { ...; }; Enums: { ...; }; CompositeTypes: { ...; }; }, { ...; } | { ...; }, "top_performers" | "popular_jobs", [] | [...]>', gave the following error.
    Argument of type '"job_views"' is not assignable to parameter of type '"top_performers" | "popular_jobs"'.

181         .from('job_views')
                  ~~~~~~~~~~~


src/hooks/use-ai-job-matching.ts:257:50 - error TS2339: Property 'split' does not exist on type 'string[]'.

257           const userSkills = userProfile.skills?.split(',') || []
                                                     ~~~~~

src/hooks/use-email-system.ts:53:52 - error TS2304: Cannot find name 'EmailRecord'.

53   const [emailHistory, setEmailHistory] = useState<EmailRecord[]>([])
                                                      ~~~~~~~~~~~

src/hooks/use-email-system.ts:63:10 - error TS2304: Cannot find name 'enabled'.

63     if (!enabled) {
            ~~~~~~~

src/hooks/use-email-system.ts:88:7 - error TS2304: Cannot find name 'enabled'.

88   }, [enabled, supabase])
         ~~~~~~~

src/hooks/use-email-system.ts:291:16 - error TS2304: Cannot find name 'enabled'.

291     isEnabled: enabled
                   ~~~~~~~

src/hooks/use-misc-apis.ts:117:8 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(values: { bookmark_type?: string; created_at?: string; id?: string; job_category_name: string; job_city_name: string; job_id?: string; job_posted_at: string; job_salary_max?: number; job_salary_min?: number; ... 4 more ...; user_id?: string; }, options?: { ...; }): PostgrestFilterBuilder<...>', gave the following error.
    Argument of type '{ user_id: string; job_id: string; }' is not assignable to parameter of type '{ bookmark_type?: string; created_at?: string; id?: string; job_category_name: string; job_city_name: string; job_id?: string; job_posted_at: string; job_salary_max?: number; job_salary_min?: number; ... 4 more ...; user_id?: string; }'.
      Type '{ user_id: string; job_id: string; }' is missing the following properties from type '{ bookmark_type?: string; created_at?: string; id?: string; job_category_name: string; job_city_name: string; job_id?: string; job_posted_at: string; job_salary_max?: number; job_salary_min?: number; ... 4 more ...; user_id?: string; }': job_category_name, job_city_name, job_posted_at, job_status, job_title
  Overload 2 of 2, '(values: { bookmark_type?: string; created_at?: string; id?: string; job_category_name: string; job_city_name: string; job_id?: string; job_posted_at: string; job_salary_max?: number; job_salary_min?: number; ... 4 more ...; user_id?: string; }[], options?: { ...; }): PostgrestFilterBuilder<...>', gave the following error.
    Object literal may only specify known properties, and 'user_id' does not exist in type '{ bookmark_type?: string; created_at?: string; id?: string; job_category_name: string; job_city_name: string; job_id?: string; job_posted_at: string; job_salary_max?: number; job_salary_min?: number; ... 4 more ...; user_id?: string; }[]'.

117       .insert({
           ~~~~~~


src/hooks/use-realtime-analytics.ts:120:17 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(relation: "account_deletion_requests" | "users" | "analytics_events" | "applications" | "job_listings" | "connection_history" | "conversations" | "file_uploads" | "job_assignments" | ... 8 more ... | "user_activity_summary"): PostgrestQueryBuilder<...>', gave the following error.
    Argument of type '"job_views"' is not assignable to parameter of type '"account_deletion_requests" | "users" | "analytics_events" | "applications" | "job_listings" | "connection_history" | "conversations" | "file_uploads" | "job_assignments" | ... 8 more ... | "user_activity_summary"'.
  Overload 2 of 2, '(relation: "top_performers" | "popular_jobs"): PostgrestQueryBuilder<{ Tables: { account_deletion_requests: { Row: { id: string; processed_at: string; processed_by_id: string; reason: string; requested_at: string; user_id: string; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 16 more ...; users: { ...; }; }; Views: { ...; }; Functions: { ...; }; Enums: { ...; }; CompositeTypes: { ...; }; }, { ...; } | { ...; }, "top_performers" | "popular_jobs", [] | [...]>', gave the following error.
    Argument of type '"job_views"' is not assignable to parameter of type '"top_performers" | "popular_jobs"'.

120           .from('job_views')
                    ~~~~~~~~~~~


src/hooks/use-realtime-analytics.ts:163:18 - error TS2339: Property 'job_id' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'."> | SelectQueryError<"column 'id' does not exist on 'users'."> | ... 15 more ... | SelectQueryError<...>'.
  Property 'job_id' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'.">'.

163         acc[view.job_id] = (acc[view.job_id] || 0) + 1
                     ~~~~~~

src/hooks/use-realtime-analytics.ts:163:38 - error TS2339: Property 'job_id' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'."> | SelectQueryError<"column 'id' does not exist on 'users'."> | ... 15 more ... | SelectQueryError<...>'.
  Property 'job_id' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'.">'.

163         acc[view.job_id] = (acc[view.job_id] || 0) + 1
                                         ~~~~~~

src/hooks/use-realtime-analytics.ts:168:29 - error TS2339: Property 'job_id' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'."> | SelectQueryError<"column 'id' does not exist on 'users'."> | ... 15 more ... | SelectQueryError<...>'.
  Property 'job_id' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'.">'.

168         const key = `${view.job_id}-${view.user_id || view.ip_address}`
                                ~~~~~~

src/hooks/use-realtime-analytics.ts:168:44 - error TS2339: Property 'user_id' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'."> | SelectQueryError<"column 'id' does not exist on 'users'."> | ... 15 more ... | SelectQueryError<...>'.
  Property 'user_id' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'.">'.

168         const key = `${view.job_id}-${view.user_id || view.ip_address}`
                                               ~~~~~~~

src/hooks/use-realtime-analytics.ts:168:60 - error TS2339: Property 'ip_address' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'."> | SelectQueryError<"column 'id' does not exist on 'users'."> | ... 15 more ... | SelectQueryError<...>'.
  Property 'ip_address' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'.">'.

168         const key = `${view.job_id}-${view.user_id || view.ip_address}`
                                                               ~~~~~~~~~~

src/hooks/use-realtime-analytics.ts:169:18 - error TS2339: Property 'job_id' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'."> | SelectQueryError<"column 'id' does not exist on 'users'."> | ... 15 more ... | SelectQueryError<...>'.
  Property 'job_id' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'.">'.

169         acc[view.job_id] = acc[view.job_id] || new Set()
                     ~~~~~~

src/hooks/use-realtime-analytics.ts:169:37 - error TS2339: Property 'job_id' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'."> | SelectQueryError<"column 'id' does not exist on 'users'."> | ... 15 more ... | SelectQueryError<...>'.
  Property 'job_id' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'.">'.

169         acc[view.job_id] = acc[view.job_id] || new Set()
                                        ~~~~~~

src/hooks/use-realtime-analytics.ts:170:18 - error TS2339: Property 'job_id' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'."> | SelectQueryError<"column 'id' does not exist on 'users'."> | ... 15 more ... | SelectQueryError<...>'.
  Property 'job_id' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'.">'.

170         acc[view.job_id].add(key)
                     ~~~~~~

src/hooks/use-realtime-analytics.ts:256:15 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(relation: "account_deletion_requests" | "users" | "analytics_events" | "applications" | "job_listings" | "connection_history" | "conversations" | "file_uploads" | "job_assignments" | ... 8 more ... | "user_activity_summary"): PostgrestQueryBuilder<...>', gave the following error.
    Argument of type '"job_views"' is not assignable to parameter of type '"account_deletion_requests" | "users" | "analytics_events" | "applications" | "job_listings" | "connection_history" | "conversations" | "file_uploads" | "job_assignments" | ... 8 more ... | "user_activity_summary"'.
  Overload 2 of 2, '(relation: "top_performers" | "popular_jobs"): PostgrestQueryBuilder<{ Tables: { account_deletion_requests: { Row: { id: string; processed_at: string; processed_by_id: string; reason: string; requested_at: string; user_id: string; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 16 more ...; users: { ...; }; }; Views: { ...; }; Functions: { ...; }; Enums: { ...; }; CompositeTypes: { ...; }; }, { ...; } | { ...; }, "top_performers" | "popular_jobs", [] | [...]>', gave the following error.
    Argument of type '"job_views"' is not assignable to parameter of type '"top_performers" | "popular_jobs"'.

256         .from('job_views')
                  ~~~~~~~~~~~


src/hooks/use-realtime-analytics.ts:258:23 - error TS2589: Type instantiation is excessively deep and possibly infinite.

258         .in('job_id', userJobs.map(j => j.id))
                          ~~~~~~~~~~~~~~~~~~~~~~~

src/hooks/use-realtime-analytics.ts:261:18 - error TS2339: Property 'job_id' does not exist on type 'SelectQueryError<"column 'job_id' does not exist on 'account_deletion_requests'."> | SelectQueryError<"column 'job_id' does not exist on 'users'."> | ... 15 more ... | SelectQueryError<...>'.
  Property 'job_id' does not exist on type 'SelectQueryError<"column 'job_id' does not exist on 'account_deletion_requests'.">'.

261         acc[view.job_id] = (acc[view.job_id] || 0) + 1
                     ~~~~~~

src/hooks/use-realtime-analytics.ts:261:38 - error TS2339: Property 'job_id' does not exist on type 'SelectQueryError<"column 'job_id' does not exist on 'account_deletion_requests'."> | SelectQueryError<"column 'job_id' does not exist on 'users'."> | ... 15 more ... | SelectQueryError<...>'.
  Property 'job_id' does not exist on type 'SelectQueryError<"column 'job_id' does not exist on 'account_deletion_requests'.">'.

261         acc[view.job_id] = (acc[view.job_id] || 0) + 1
                                         ~~~~~~

src/hooks/use-supabase-realtime-chat-backup.ts:56:28 - error TS2554: Expected 1 arguments, but got 0.

56   const typingTimeoutRef = useRef<NodeJS.Timeout>()
                              ~~~~~~

  node_modules/@types/react/index.d.ts:1728:24
    1728     function useRef<T>(initialValue: T): RefObject<T>;
                                ~~~~~~~~~~~~~~~
    An argument for 'initialValue' was not provided.

src/hooks/use-supabase-realtime-chat-backup.ts:112:19 - error TS2345: Argument of type '{ attachment_url: string; content: string; conversation_id: string; created_at: string; id: string; message_type: string; read_by: string[]; sender_avatar_url: string; sender_id: string; sender_name: string; }[]' is not assignable to parameter of type 'SetStateAction<Message[]>'.
  Type '{ attachment_url: string; content: string; conversation_id: string; created_at: string; id: string; message_type: string; read_by: string[]; sender_avatar_url: string; sender_id: string; sender_name: string; }[]' is not assignable to type 'Message[]'.
    Type '{ attachment_url: string; content: string; conversation_id: string; created_at: string; id: string; message_type: string; read_by: string[]; sender_avatar_url: string; sender_id: string; sender_name: string; }' is not assignable to type 'Message'.
      Types of property 'message_type' are incompatible.
        Type 'string' is not assignable to type '"text" | "image" | "file"'.

112       setMessages(data || [])
                      ~~~~~~~~~~

src/hooks/use-supabase-realtime-chat-fixed.ts:129:19 - error TS2345: Argument of type '{ attachment_url: string; content: string; conversation_id: string; created_at: string; id: string; message_type: string; read_by: string[]; sender_avatar_url: string; sender_id: string; sender_name: string; }[]' is not assignable to parameter of type 'SetStateAction<Message[]>'.
  Type '{ attachment_url: string; content: string; conversation_id: string; created_at: string; id: string; message_type: string; read_by: string[]; sender_avatar_url: string; sender_id: string; sender_name: string; }[]' is not assignable to type 'Message[]'.
    Type '{ attachment_url: string; content: string; conversation_id: string; created_at: string; id: string; message_type: string; read_by: string[]; sender_avatar_url: string; sender_id: string; sender_name: string; }' is not assignable to type 'Message'.
      Types of property 'message_type' are incompatible.
        Type 'string' is not assignable to type '"text" | "image" | "file"'.

129       setMessages(data || [])
                      ~~~~~~~~~~

src/hooks/use-supabase-realtime-chat-fixed.ts:198:19 - error TS2345: Argument of type '(prev: Message[]) => ({ attachment_url: string; content: string; conversation_id: string; created_at: string; id: string; message_type: string; read_by: string[]; sender_avatar_url: string; sender_id: string; sender_name: string; } | Message)[]' is not assignable to parameter of type 'SetStateAction<Message[]>'.
  Type '(prev: Message[]) => ({ attachment_url: string; content: string; conversation_id: string; created_at: string; id: string; message_type: string; read_by: string[]; sender_avatar_url: string; sender_id: string; sender_name: string; } | Message)[]' is not assignable to type '(prevState: Message[]) => Message[]'.
    Type '({ attachment_url: string; content: string; conversation_id: string; created_at: string; id: string; message_type: string; read_by: string[]; sender_avatar_url: string; sender_id: string; sender_name: string; } | Message)[]' is not assignable to type 'Message[]'.
      Type '{ attachment_url: string; content: string; conversation_id: string; created_at: string; id: string; message_type: string; read_by: string[]; sender_avatar_url: string; sender_id: string; sender_name: string; } | Message' is not assignable to type 'Message'.
        Type '{ attachment_url: string; content: string; conversation_id: string; created_at: string; id: string; message_type: string; read_by: string[]; sender_avatar_url: string; sender_id: string; sender_name: string; }' is not assignable to type 'Message'.
          Types of property 'message_type' are incompatible.
            Type 'string' is not assignable to type '"text" | "image" | "file"'.

198       setMessages(prev => prev.map(msg =>
                      ~~~~~~~~~~~~~~~~~~~~~~~
199         msg.id === tempMessage.id ? data : msg
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
200       ))
    ~~~~~~~

src/hooks/use-supabase-realtime-chat-postgres.ts:116:35 - error TS2339: Property 'deleted_by_users' does not exist on type 'SelectQueryError<"column 'deleted_by_users' does not exist on 'messages'.">'.

116         const deletedBy = message.deleted_by_users || []
                                      ~~~~~~~~~~~~~~~~

src/hooks/use-supabase-realtime-chat-postgres.ts:122:23 - error TS2353: Object literal may only specify known properties, and 'deleted_by_users' does not exist in type '{ attachment_url?: string; content?: string; conversation_id?: string; created_at?: string; id?: string; message_type?: string; read_by?: string[]; sender_avatar_url?: string; sender_id?: string; sender_name?: string; }'.

122             .update({ deleted_by_users: deletedBy })
                          ~~~~~~~~~~~~~~~~

src/hooks/use-supabase-realtime-chat-postgres.ts:123:31 - error TS2339: Property 'id' does not exist on type 'SelectQueryError<"column 'deleted_by_users' does not exist on 'messages'.">'.

123             .eq('id', message.id)
                                  ~~

src/hooks/use-supabase-realtime-chat-postgres.ts:151:39 - error TS2339: Property 'hidden_for_users' does not exist on type 'SelectQueryError<"column 'hidden_for_users' does not exist on 'conversations'.">'.

151       const hiddenFor = conversation?.hidden_for_users || []
                                          ~~~~~~~~~~~~~~~~

src/hooks/use-supabase-realtime-chat-postgres.ts:157:21 - error TS2353: Object literal may only specify known properties, and 'hidden_for_users' does not exist in type '{ application_id?: string; created_at?: string; created_by_id?: string; id?: string; is_active?: boolean; job_id?: string; last_message_at?: string; last_message_preview?: string; last_sender_id?: string; ... 6 more ...; updated_at?: string; }'.

157           .update({ hidden_for_users: hiddenFor })
                        ~~~~~~~~~~~~~~~~

src/hooks/use-supabase-realtime-chat-postgres.ts:187:34 - error TS2339: Property 'deleted_by_users' does not exist on type 'SelectQueryError<"column 'deleted_by_users' does not exist on 'messages'.">'.

187       const deletedBy = message?.deleted_by_users || []
                                     ~~~~~~~~~~~~~~~~

src/hooks/use-supabase-realtime-chat-postgres.ts:193:21 - error TS2353: Object literal may only specify known properties, and 'deleted_by_users' does not exist in type '{ attachment_url?: string; content?: string; conversation_id?: string; created_at?: string; id?: string; message_type?: string; read_by?: string[]; sender_avatar_url?: string; sender_id?: string; sender_name?: string; }'.

193           .update({ deleted_by_users: deletedBy })
                        ~~~~~~~~~~~~~~~~

src/hooks/use-supabase-realtime-chat-postgres.ts:240:41 - error TS2339: Property 'hidden_for_users' does not exist on type '{ application_id: string; created_at: string; created_by_id: string; id: string; is_active: boolean; job_id: string; last_message_at: string; last_message_preview: string; last_sender_id: string; ... 6 more ...; updated_at: string; }'.

240             const hiddenForUsers = conv.hidden_for_users || []
                                            ~~~~~~~~~~~~~~~~

src/hooks/use-supabase-realtime-chat-postgres.ts:289:38 - error TS2339: Property 'deleted_by_users' does not exist on type '{ attachment_url: string; content: string; conversation_id: string; created_at: string; id: string; message_type: string; read_by: string[]; sender_avatar_url: string; sender_id: string; sender_name: string; }'.

289           const deletedByUsers = msg.deleted_by_users || []
                                         ~~~~~~~~~~~~~~~~

src/lib/supabase-server.ts:157:14 - error TS2339: Property 'userData' does not exist on type 'User | { userData: { applications_received: number; applications_sent: number; avatar_url: string; average_rating: number; bio: string; company_name: string; connections: number; connections_last_refresh: string; ... 38 more ...; website: string; }; ... 24 more ...; deleted_at?: string; }'.
  Property 'userData' does not exist on type 'User'.

157   if (!user?.userData) {
                 ~~~~~~~~

src/lib/supabase-server.ts:161:12 - error TS2339: Property 'userData' does not exist on type 'User | { userData: { applications_received: number; applications_sent: number; avatar_url: string; average_rating: number; bio: string; company_name: string; connections: number; connections_last_refresh: string; ... 38 more ...; website: string; }; ... 24 more ...; deleted_at?: string; }'.
  Property 'userData' does not exist on type 'User'.

161   if (user.userData.role !== requiredRole && user.userData.role !== 'admin') {
               ~~~~~~~~

src/lib/supabase-server.ts:161:51 - error TS2339: Property 'userData' does not exist on type 'User | { userData: { applications_received: number; applications_sent: number; avatar_url: string; average_rating: number; bio: string; company_name: string; connections: number; connections_last_refresh: string; ... 38 more ...; website: string; }; ... 24 more ...; deleted_at?: string; }'.
  Property 'userData' does not exist on type 'User'.

161   if (user.userData.role !== requiredRole && user.userData.role !== 'admin') {
                                                      ~~~~~~~~


Found 70 errors in 20 files.

Errors  Files
     1  src/components/dashboard/tasker/application-tracker.tsx:316
     1  src/components/dashboard/tasker/applied-jobs-section.tsx:156
     4  src/components/dashboard/tasker/job-applications-manager.tsx:22
     6  src/components/dashboard/tasker/shortlisted-jobs-section.tsx:49
     1  src/components/dashboard/tasker/tasker-stats-cards.tsx:30
     3  src/components/jobs/job-post-form.tsx:33
     2  src/components/jobs/job-post-form/job-cost-info.tsx:24
     1  src/components/jobs/job-post-form/review-step.tsx:70
     1  src/components/jobs/job-post-form/use-job-form-state.ts:268
     1  src/components/jobs/job/job-application-sidebar.tsx:42
     5  src/hooks/queries/useApplications.ts:13
     6  src/hooks/queries/useStaticData.ts:15
     4  src/hooks/use-ai-job-matching.ts:118
     4  src/hooks/use-email-system.ts:53
     1  src/hooks/use-misc-apis.ts:117
    13  src/hooks/use-realtime-analytics.ts:120
     2  src/hooks/use-supabase-realtime-chat-backup.ts:56
     2  src/hooks/use-supabase-realtime-chat-fixed.ts:129
     9  src/hooks/use-supabase-realtime-chat-postgres.ts:116
     3  src/lib/supabase-server.ts:157
     ~/Doc/G/mojposlic     main !53 ?1  npx tsc --noEmit
src/components/dashboard/tasker/job-applications-manager.tsx:22:51 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(predicate: (value: { applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; ... 32 more ...; user: { ...; }; }, index: number, array: { ...; }[]) => value is { ...; }, thisArg?: any): { ...; }[]', gave the following error.
    Argument of type '(app: JobApplication) => boolean' is not assignable to parameter of type '(value: { applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; availability: string; ... 31 more ...; user: { ...; }; }, index: number, array: { ...; }[]) => value is { ...; }'.
      Types of parameters 'app' and 'value' are incompatible.
        Type '{ applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; availability: string; ... 31 more ...; user: { ...; }; }' is not assignable to type 'JobApplication'.
          Types of property 'status' are incompatible.
            Type '"PENDING" | "REVIEWED" | "SHORTLISTED" | "SELECTED" | "REJECTED" | "WITHDRAWN"' is not assignable to type 'ApplicationStatus'.
              Type '"PENDING"' is not assignable to type 'ApplicationStatus'.
  Overload 2 of 2, '(predicate: (value: { applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; ... 32 more ...; user: { ...; }; }, index: number, array: { ...; }[]) => unknown, thisArg?: any): { ...; }[]', gave the following error.
    Argument of type '(app: JobApplication) => boolean' is not assignable to parameter of type '(value: { applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; availability: string; ... 31 more ...; user: { ...; }; }, index: number, array: { ...; }[]) => unknown'.
      Types of parameters 'app' and 'value' are incompatible.
        Type '{ applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; availability: string; ... 31 more ...; user: { ...; }; }' is not assignable to type 'JobApplication'.
          Types of property 'status' are incompatible.
            Type '"PENDING" | "REVIEWED" | "SHORTLISTED" | "SELECTED" | "REJECTED" | "WITHDRAWN"' is not assignable to type 'ApplicationStatus'.
              Type '"PENDING"' is not assignable to type 'ApplicationStatus'.

22   const pendingApplications = applications.filter((app: JobApplication) => app.status === ApplicationStatus.PENDING)
                                                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


src/components/dashboard/tasker/job-applications-manager.tsx:23:52 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(predicate: (value: { applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; ... 32 more ...; user: { ...; }; }, index: number, array: { ...; }[]) => value is { ...; }, thisArg?: any): { ...; }[]', gave the following error.
    Argument of type '(app: JobApplication) => boolean' is not assignable to parameter of type '(value: { applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; availability: string; ... 31 more ...; user: { ...; }; }, index: number, array: { ...; }[]) => value is { ...; }'.
      Types of parameters 'app' and 'value' are incompatible.
        Type '{ applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; availability: string; ... 31 more ...; user: { ...; }; }' is not assignable to type 'JobApplication'.
          Types of property 'status' are incompatible.
            Type '"PENDING" | "REVIEWED" | "SHORTLISTED" | "SELECTED" | "REJECTED" | "WITHDRAWN"' is not assignable to type 'ApplicationStatus'.
              Type '"PENDING"' is not assignable to type 'ApplicationStatus'.
  Overload 2 of 2, '(predicate: (value: { applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; ... 32 more ...; user: { ...; }; }, index: number, array: { ...; }[]) => unknown, thisArg?: any): { ...; }[]', gave the following error.
    Argument of type '(app: JobApplication) => boolean' is not assignable to parameter of type '(value: { applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; availability: string; ... 31 more ...; user: { ...; }; }, index: number, array: { ...; }[]) => unknown'.
      Types of parameters 'app' and 'value' are incompatible.
        Type '{ applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; availability: string; ... 31 more ...; user: { ...; }; }' is not assignable to type 'JobApplication'.
          Types of property 'status' are incompatible.
            Type '"PENDING" | "REVIEWED" | "SHORTLISTED" | "SELECTED" | "REJECTED" | "WITHDRAWN"' is not assignable to type 'ApplicationStatus'.
              Type '"PENDING"' is not assignable to type 'ApplicationStatus'.

23   const reviewedApplications = applications.filter((app: JobApplication) =>
                                                      ~~~~~~~~~~~~~~~~~~~~~~~~
24     app.status === ApplicationStatus.REVIEWED ||
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
25     app.status === ApplicationStatus.SHORTLISTED ||
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
26     app.status === ApplicationStatus.SELECTED
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


src/components/dashboard/tasker/job-applications-manager.tsx:109:42 - error TS2345: Argument of type '(application: JobApplication) => JSX.Element' is not assignable to parameter of type '(value: { applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; availability: string; ... 31 more ...; user: { ...; }; }, index: number, array: { ...; }[]) => Element'.
  Types of parameters 'application' and 'value' are incompatible.
    Type '{ applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; availability: string; ... 31 more ...; user: { ...; }; }' is not assignable to type 'JobApplication'.
      Types of property 'status' are incompatible.
        Type '"PENDING" | "REVIEWED" | "SHORTLISTED" | "SELECTED" | "REJECTED" | "WITHDRAWN"' is not assignable to type 'ApplicationStatus'.
          Type '"PENDING"' is not assignable to type 'ApplicationStatus'.

109                 {pendingApplications.map((application: JobApplication) => (
                                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
110                   <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
... 
140                   </div>
    ~~~~~~~~~~~~~~~~~~~~~~~~
141                 ))}
    ~~~~~~~~~~~~~~~~~

src/components/dashboard/tasker/job-applications-manager.tsx:160:43 - error TS2345: Argument of type '(application: JobApplication) => JSX.Element' is not assignable to parameter of type '(value: { applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; availability: string; ... 31 more ...; user: { ...; }; }, index: number, array: { ...; }[]) => Element'.
  Types of parameters 'application' and 'value' are incompatible.
    Type '{ applicant_avatar_url: string; applicant_email: string; applicant_location: string; applicant_name: string; applicant_phone: string; applicant_rating: number; applied_at: string; availability: string; ... 31 more ...; user: { ...; }; }' is not assignable to type 'JobApplication'.
      Types of property 'status' are incompatible.
        Type '"PENDING" | "REVIEWED" | "SHORTLISTED" | "SELECTED" | "REJECTED" | "WITHDRAWN"' is not assignable to type 'ApplicationStatus'.
          Type '"PENDING"' is not assignable to type 'ApplicationStatus'.

160                 {reviewedApplications.map((application: JobApplication) => (
                                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
161                   <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
... 
191                   </div>
    ~~~~~~~~~~~~~~~~~~~~~~~~
192                 ))}
    ~~~~~~~~~~~~~~~~~

src/components/jobs/job-post-form.tsx:81:35 - error TS2345: Argument of type 'StaticCategory[]' is not assignable to parameter of type 'SetStateAction<Category[]>'.
  Type 'StaticCategory[]' is not assignable to type 'Category[]'.
    Type 'StaticCategory' is not assignable to type 'Category'.
      Property 'sort_order' is optional in type 'StaticCategory' but required in type 'Category'.

81       setAvailableChildCategories(parentCategory?.children || [])
                                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/components/jobs/job-post-form/job-cost-info.tsx:24:44 - error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.

24     willCostConnections: getJobPostingCost(todayCount) > 0,
                                              ~~~~~~~~~~

src/components/jobs/job-post-form/job-cost-info.tsx:25:39 - error TS2345: Argument of type 'number' is not assignable to parameter of type 'string'.

25     connectionCost: getJobPostingCost(todayCount)
                                         ~~~~~~~~~~

src/components/jobs/job-post-form/review-step.tsx:70:15 - error TS2345: Argument of type 'StaticCity' is not assignable to parameter of type 'SetStateAction<City>'.
  Property 'state' is missing in type 'StaticCity' but required in type 'City'.

70       setCity(foundCity || null)
                 ~~~~~~~~~~~~~~~~~

  src/lib/static-data-types.ts:13:3
    13   state: string
         ~~~~~
    'state' is declared here.

src/components/jobs/job/job-application-sidebar.tsx:42:21 - error TS2339: Property 'role' does not exist on type '{ name?: string; email?: string; id?: string; }'.

42           ) : user?.role === 'client' ? (
                       ~~~~

src/hooks/queries/useApplications.ts:13:51 - error TS2345: Argument of type 'string' is not assignable to parameter of type 'ApplicationFilters'.

13     queryKey: jobId ? queryKeys.jobs.applications(jobId) : queryKeys.applications.all,
                                                     ~~~~~

src/hooks/queries/useApplications.ts:71:10 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(values: { applicant_avatar_url?: string; applicant_email: string; applicant_location?: string; applicant_name: string; applicant_phone?: string; applicant_rating?: number; applied_at?: string; availability?: string; ... 29 more ...; user_id?: string; }, options?: { ...; }): PostgrestFilterBuilder<...>', gave the following error.
    Argument of type '{ applied_at?: string; availability?: string; client_notes?: string; contact_info?: string; cover_letter?: string; estimated_duration?: string; hourly_rate?: number; id?: string; job_id?: string; questions_answers?: Json; resume_url?: string; status?: "PENDING" | ... 4 more ... | "WITHDRAWN"; updated_at?: string; us...' is not assignable to parameter of type '{ applicant_avatar_url?: string; applicant_email: string; applicant_location?: string; applicant_name: string; applicant_phone?: string; applicant_rating?: number; applied_at?: string; availability?: string; ... 29 more ...; user_id?: string; }'.
      Type '{ applied_at?: string; availability?: string; client_notes?: string; contact_info?: string; cover_letter?: string; estimated_duration?: string; hourly_rate?: number; id?: string; job_id?: string; questions_answers?: Json; resume_url?: string; status?: "PENDING" | ... 4 more ... | "WITHDRAWN"; updated_at?: string; us...' is missing the following properties from type '{ applicant_avatar_url?: string; applicant_email: string; applicant_location?: string; applicant_name: string; applicant_phone?: string; applicant_rating?: number; applied_at?: string; availability?: string; ... 29 more ...; user_id?: string; }': applicant_email, applicant_name, job_category_name, job_city_name, and 3 more.
  Overload 2 of 2, '(values: { applicant_avatar_url?: string; applicant_email: string; applicant_location?: string; applicant_name: string; applicant_phone?: string; applicant_rating?: number; applied_at?: string; availability?: string; ... 29 more ...; user_id?: string; }[], options?: { ...; }): PostgrestFilterBuilder<...>', gave the following error.
    Type '{ applied_at?: string; availability?: string; client_notes?: string; contact_info?: string; cover_letter?: string; estimated_duration?: string; hourly_rate?: number; id?: string; job_id?: string; questions_answers?: Json; resume_url?: string; status?: "PENDING" | ... 4 more ... | "WITHDRAWN"; updated_at?: string; us...' is missing the following properties from type '{ applicant_avatar_url?: string; applicant_email: string; applicant_location?: string; applicant_name: string; applicant_phone?: string; applicant_rating?: number; applied_at?: string; availability?: string; ... 29 more ...; user_id?: string; }': applicant_email, applicant_name, job_category_name, job_city_name, and 3 more.

71         .insert([applicationData])
            ~~~~~~


src/hooks/queries/useApplications.ts:86:49 - error TS2345: Argument of type 'string' is not assignable to parameter of type 'ApplicationFilters'.

86           queryKey: queryKeys.jobs.applications(newApplication.job_id)
                                                   ~~~~~~~~~~~~~~~~~~~~~

src/hooks/queries/useApplications.ts:130:49 - error TS2345: Argument of type 'string' is not assignable to parameter of type 'ApplicationFilters'.

130           queryKey: queryKeys.jobs.applications(updatedApplication.job_id)
                                                    ~~~~~~~~~~~~~~~~~~~~~~~~~

src/hooks/queries/useApplications.ts:174:51 - error TS2345: Argument of type 'string' is not assignable to parameter of type 'ApplicationFilters'.

174             queryKey: queryKeys.jobs.applications(jobId)
                                                      ~~~~~

src/hooks/queries/useStaticData.ts:15:37 - error TS2589: Type instantiation is excessively deep and possibly infinite.

15       const { data, error } = await supabase
                                       ~~~~~~~~
16         .from('cities')
   ~~~~~~~~~~~~~~~~~~~~~~~
17         .select('*')
   ~~~~~~~~~~~~~~~~~~~~
18         .eq('is_active', true)
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/hooks/queries/useStaticData.ts:16:15 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(relation: "account_deletion_requests" | "users" | "analytics_events" | "applications" | "job_listings" | "connection_history" | "conversations" | "file_uploads" | "job_assignments" | ... 8 more ... | "user_activity_summary"): PostgrestQueryBuilder<...>', gave the following error.
    Argument of type '"cities"' is not assignable to parameter of type '"account_deletion_requests" | "users" | "analytics_events" | "applications" | "job_listings" | "connection_history" | "conversations" | "file_uploads" | "job_assignments" | ... 8 more ... | "user_activity_summary"'.
  Overload 2 of 2, '(relation: "top_performers" | "popular_jobs"): PostgrestQueryBuilder<{ Tables: { account_deletion_requests: { Row: { id: string; processed_at: string; processed_by_id: string; reason: string; requested_at: string; user_id: string; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 16 more ...; users: { ...; }; }; Views: { ...; }; Functions: { ...; }; Enums: { ...; }; CompositeTypes: { ...; }; }, { ...; } | { ...; }, "top_performers" | "popular_jobs", [] | [...]>', gave the following error.
    Argument of type '"cities"' is not assignable to parameter of type '"top_performers" | "popular_jobs"'.

16         .from('cities')
                 ~~~~~~~~


src/hooks/queries/useStaticData.ts:25:7 - error TS2322: Type '({ applications_received: number; applications_sent: number; avatar_url: string; average_rating: number; bio: string; company_name: string; connections: number; connections_last_refresh: string; ... 38 more ...; website: string; } | ... 16 more ... | { ...; })[]' is not assignable to type '{ country: string; created_at: string; id: string; is_active: boolean; is_special: boolean; key: string; latitude: number; longitude: number; name: string; }[]'.
  Type '{ applications_received: number; applications_sent: number; avatar_url: string; average_rating: number; bio: string; company_name: string; connections: number; connections_last_refresh: string; ... 38 more ...; website: string; } | ... 16 more ... | { ...; }' is not assignable to type '{ country: string; created_at: string; id: string; is_active: boolean; is_special: boolean; key: string; latitude: number; longitude: number; name: string; }'.
    Type '{ applications_received: number; applications_sent: number; avatar_url: string; average_rating: number; bio: string; company_name: string; connections: number; connections_last_refresh: string; ... 38 more ...; website: string; }' is missing the following properties from type '{ country: string; created_at: string; id: string; is_active: boolean; is_special: boolean; key: string; latitude: number; longitude: number; name: string; }': country, is_active, is_special, key, and 2 more.

25       return data || []
         ~~~~~~

src/hooks/queries/useStaticData.ts:43:15 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(relation: "account_deletion_requests" | "users" | "analytics_events" | "applications" | "job_listings" | "connection_history" | "conversations" | "file_uploads" | "job_assignments" | ... 8 more ... | "user_activity_summary"): PostgrestQueryBuilder<...>', gave the following error.
    Argument of type '"categories"' is not assignable to parameter of type '"account_deletion_requests" | "users" | "analytics_events" | "applications" | "job_listings" | "connection_history" | "conversations" | "file_uploads" | "job_assignments" | ... 8 more ... | "user_activity_summary"'.
  Overload 2 of 2, '(relation: "top_performers" | "popular_jobs"): PostgrestQueryBuilder<{ Tables: { account_deletion_requests: { Row: { id: string; processed_at: string; processed_by_id: string; reason: string; requested_at: string; user_id: string; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 16 more ...; users: { ...; }; }; Views: { ...; }; Functions: { ...; }; Enums: { ...; }; CompositeTypes: { ...; }; }, { ...; } | { ...; }, "top_performers" | "popular_jobs", [] | [...]>', gave the following error.
    Argument of type '"categories"' is not assignable to parameter of type '"top_performers" | "popular_jobs"'.

43         .from('categories')
                 ~~~~~~~~~~~~


src/hooks/queries/useStaticData.ts:68:37 - error TS2589: Type instantiation is excessively deep and possibly infinite.

68       const { data, error } = await supabase
                                       ~~~~~~~~
69         .from('categories')
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~
70         .select('*')
   ~~~~~~~~~~~~~~~~~~~~
71         .eq('is_popular', true)
   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/hooks/queries/useStaticData.ts:69:15 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(relation: "account_deletion_requests" | "users" | "analytics_events" | "applications" | "job_listings" | "connection_history" | "conversations" | "file_uploads" | "job_assignments" | ... 8 more ... | "user_activity_summary"): PostgrestQueryBuilder<...>', gave the following error.
    Argument of type '"categories"' is not assignable to parameter of type '"account_deletion_requests" | "users" | "analytics_events" | "applications" | "job_listings" | "connection_history" | "conversations" | "file_uploads" | "job_assignments" | ... 8 more ... | "user_activity_summary"'.
  Overload 2 of 2, '(relation: "top_performers" | "popular_jobs"): PostgrestQueryBuilder<{ Tables: { account_deletion_requests: { Row: { id: string; processed_at: string; processed_by_id: string; reason: string; requested_at: string; user_id: string; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 16 more ...; users: { ...; }; }; Views: { ...; }; Functions: { ...; }; Enums: { ...; }; CompositeTypes: { ...; }; }, { ...; } | { ...; }, "top_performers" | "popular_jobs", [] | [...]>', gave the following error.
    Argument of type '"categories"' is not assignable to parameter of type '"top_performers" | "popular_jobs"'.

69         .from('categories')
                 ~~~~~~~~~~~~


src/hooks/use-ai-job-matching.ts:118:10 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(values: { bookmark_type?: string; created_at?: string; id?: string; job_category_name: string; job_city_name: string; job_id?: string; job_posted_at: string; job_salary_max?: number; job_salary_min?: number; ... 4 more ...; user_id?: string; }, options?: { ...; }): PostgrestFilterBuilder<...>', gave the following error.
    Argument of type '{ user_id: string; job_id: string; }' is not assignable to parameter of type '{ bookmark_type?: string; created_at?: string; id?: string; job_category_name: string; job_city_name: string; job_id?: string; job_posted_at: string; job_salary_max?: number; job_salary_min?: number; ... 4 more ...; user_id?: string; }'.
      Type '{ user_id: string; job_id: string; }' is missing the following properties from type '{ bookmark_type?: string; created_at?: string; id?: string; job_category_name: string; job_city_name: string; job_id?: string; job_posted_at: string; job_salary_max?: number; job_salary_min?: number; ... 4 more ...; user_id?: string; }': job_category_name, job_city_name, job_posted_at, job_status, job_title
  Overload 2 of 2, '(values: { bookmark_type?: string; created_at?: string; id?: string; job_category_name: string; job_city_name: string; job_id?: string; job_posted_at: string; job_salary_max?: number; job_salary_min?: number; ... 4 more ...; user_id?: string; }[], options?: { ...; }): PostgrestFilterBuilder<...>', gave the following error.
    Object literal may only specify known properties, and 'user_id' does not exist in type '{ bookmark_type?: string; created_at?: string; id?: string; job_category_name: string; job_city_name: string; job_id?: string; job_posted_at: string; job_salary_max?: number; job_salary_min?: number; ... 4 more ...; user_id?: string; }[]'.

118         .upsert({
             ~~~~~~


src/hooks/use-ai-job-matching.ts:148:10 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(values: { applicant_avatar_url?: string; applicant_email: string; applicant_location?: string; applicant_name: string; applicant_phone?: string; applicant_rating?: number; applied_at?: string; availability?: string; ... 29 more ...; user_id?: string; }, options?: { ...; }): PostgrestFilterBuilder<...>', gave the following error.
    Argument of type '{ job_id: string; user_id: string; cover_letter: string; hourly_rate: number; estimated_duration: string; }' is not assignable to parameter of type '{ applicant_avatar_url?: string; applicant_email: string; applicant_location?: string; applicant_name: string; applicant_phone?: string; applicant_rating?: number; applied_at?: string; availability?: string; ... 29 more ...; user_id?: string; }'.
      Type '{ job_id: string; user_id: string; cover_letter: string; hourly_rate: number; estimated_duration: string; }' is missing the following properties from type '{ applicant_avatar_url?: string; applicant_email: string; applicant_location?: string; applicant_name: string; applicant_phone?: string; applicant_rating?: number; applied_at?: string; availability?: string; ... 29 more ...; user_id?: string; }': applicant_email, applicant_name, job_category_name, job_city_name, and 3 more.
  Overload 2 of 2, '(values: { applicant_avatar_url?: string; applicant_email: string; applicant_location?: string; applicant_name: string; applicant_phone?: string; applicant_rating?: number; applied_at?: string; availability?: string; ... 29 more ...; user_id?: string; }[], options?: { ...; }): PostgrestFilterBuilder<...>', gave the following error.
    Object literal may only specify known properties, and 'job_id' does not exist in type '{ applicant_avatar_url?: string; applicant_email: string; applicant_location?: string; applicant_name: string; applicant_phone?: string; applicant_rating?: number; applied_at?: string; availability?: string; ... 29 more ...; user_id?: string; }[]'.

148         .insert({
             ~~~~~~


src/hooks/use-ai-job-matching.ts:181:15 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(relation: "account_deletion_requests" | "users" | "analytics_events" | "applications" | "job_listings" | "connection_history" | "conversations" | "file_uploads" | "job_assignments" | ... 8 more ... | "user_activity_summary"): PostgrestQueryBuilder<...>', gave the following error.
    Argument of type '"job_views"' is not assignable to parameter of type '"account_deletion_requests" | "users" | "analytics_events" | "applications" | "job_listings" | "connection_history" | "conversations" | "file_uploads" | "job_assignments" | ... 8 more ... | "user_activity_summary"'.
  Overload 2 of 2, '(relation: "top_performers" | "popular_jobs"): PostgrestQueryBuilder<{ Tables: { account_deletion_requests: { Row: { id: string; processed_at: string; processed_by_id: string; reason: string; requested_at: string; user_id: string; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 16 more ...; users: { ...; }; }; Views: { ...; }; Functions: { ...; }; Enums: { ...; }; CompositeTypes: { ...; }; }, { ...; } | { ...; }, "top_performers" | "popular_jobs", [] | [...]>', gave the following error.
    Argument of type '"job_views"' is not assignable to parameter of type '"top_performers" | "popular_jobs"'.

181         .from('job_views')
                  ~~~~~~~~~~~


src/hooks/use-ai-job-matching.ts:257:50 - error TS2339: Property 'split' does not exist on type 'string[]'.

257           const userSkills = userProfile.skills?.split(',') || []
                                                     ~~~~~

src/hooks/use-email-system.ts:53:52 - error TS2304: Cannot find name 'EmailRecord'.

53   const [emailHistory, setEmailHistory] = useState<EmailRecord[]>([])
                                                      ~~~~~~~~~~~

src/hooks/use-email-system.ts:63:10 - error TS2304: Cannot find name 'enabled'.

63     if (!enabled) {
            ~~~~~~~

src/hooks/use-email-system.ts:88:7 - error TS2304: Cannot find name 'enabled'.

88   }, [enabled, supabase])
         ~~~~~~~

src/hooks/use-email-system.ts:291:16 - error TS2304: Cannot find name 'enabled'.

291     isEnabled: enabled
                   ~~~~~~~

src/hooks/use-misc-apis.ts:117:8 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(values: { bookmark_type?: string; created_at?: string; id?: string; job_category_name: string; job_city_name: string; job_id?: string; job_posted_at: string; job_salary_max?: number; job_salary_min?: number; ... 4 more ...; user_id?: string; }, options?: { ...; }): PostgrestFilterBuilder<...>', gave the following error.
    Argument of type '{ user_id: string; job_id: string; }' is not assignable to parameter of type '{ bookmark_type?: string; created_at?: string; id?: string; job_category_name: string; job_city_name: string; job_id?: string; job_posted_at: string; job_salary_max?: number; job_salary_min?: number; ... 4 more ...; user_id?: string; }'.
      Type '{ user_id: string; job_id: string; }' is missing the following properties from type '{ bookmark_type?: string; created_at?: string; id?: string; job_category_name: string; job_city_name: string; job_id?: string; job_posted_at: string; job_salary_max?: number; job_salary_min?: number; ... 4 more ...; user_id?: string; }': job_category_name, job_city_name, job_posted_at, job_status, job_title
  Overload 2 of 2, '(values: { bookmark_type?: string; created_at?: string; id?: string; job_category_name: string; job_city_name: string; job_id?: string; job_posted_at: string; job_salary_max?: number; job_salary_min?: number; ... 4 more ...; user_id?: string; }[], options?: { ...; }): PostgrestFilterBuilder<...>', gave the following error.
    Object literal may only specify known properties, and 'user_id' does not exist in type '{ bookmark_type?: string; created_at?: string; id?: string; job_category_name: string; job_city_name: string; job_id?: string; job_posted_at: string; job_salary_max?: number; job_salary_min?: number; ... 4 more ...; user_id?: string; }[]'.

117       .insert({
           ~~~~~~


src/hooks/use-realtime-analytics.ts:120:17 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(relation: "account_deletion_requests" | "users" | "analytics_events" | "applications" | "job_listings" | "connection_history" | "conversations" | "file_uploads" | "job_assignments" | ... 8 more ... | "user_activity_summary"): PostgrestQueryBuilder<...>', gave the following error.
    Argument of type '"job_views"' is not assignable to parameter of type '"account_deletion_requests" | "users" | "analytics_events" | "applications" | "job_listings" | "connection_history" | "conversations" | "file_uploads" | "job_assignments" | ... 8 more ... | "user_activity_summary"'.
  Overload 2 of 2, '(relation: "top_performers" | "popular_jobs"): PostgrestQueryBuilder<{ Tables: { account_deletion_requests: { Row: { id: string; processed_at: string; processed_by_id: string; reason: string; requested_at: string; user_id: string; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 16 more ...; users: { ...; }; }; Views: { ...; }; Functions: { ...; }; Enums: { ...; }; CompositeTypes: { ...; }; }, { ...; } | { ...; }, "top_performers" | "popular_jobs", [] | [...]>', gave the following error.
    Argument of type '"job_views"' is not assignable to parameter of type '"top_performers" | "popular_jobs"'.

120           .from('job_views')
                    ~~~~~~~~~~~


src/hooks/use-realtime-analytics.ts:163:18 - error TS2339: Property 'job_id' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'."> | SelectQueryError<"column 'id' does not exist on 'users'."> | ... 15 more ... | SelectQueryError<...>'.
  Property 'job_id' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'.">'.

163         acc[view.job_id] = (acc[view.job_id] || 0) + 1
                     ~~~~~~

src/hooks/use-realtime-analytics.ts:163:38 - error TS2339: Property 'job_id' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'."> | SelectQueryError<"column 'id' does not exist on 'users'."> | ... 15 more ... | SelectQueryError<...>'.
  Property 'job_id' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'.">'.

163         acc[view.job_id] = (acc[view.job_id] || 0) + 1
                                         ~~~~~~

src/hooks/use-realtime-analytics.ts:168:29 - error TS2339: Property 'job_id' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'."> | SelectQueryError<"column 'id' does not exist on 'users'."> | ... 15 more ... | SelectQueryError<...>'.
  Property 'job_id' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'.">'.

168         const key = `${view.job_id}-${view.user_id || view.ip_address}`
                                ~~~~~~

src/hooks/use-realtime-analytics.ts:168:44 - error TS2339: Property 'user_id' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'."> | SelectQueryError<"column 'id' does not exist on 'users'."> | ... 15 more ... | SelectQueryError<...>'.
  Property 'user_id' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'.">'.

168         const key = `${view.job_id}-${view.user_id || view.ip_address}`
                                               ~~~~~~~

src/hooks/use-realtime-analytics.ts:168:60 - error TS2339: Property 'ip_address' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'."> | SelectQueryError<"column 'id' does not exist on 'users'."> | ... 15 more ... | SelectQueryError<...>'.
  Property 'ip_address' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'.">'.

168         const key = `${view.job_id}-${view.user_id || view.ip_address}`
                                                               ~~~~~~~~~~

src/hooks/use-realtime-analytics.ts:169:18 - error TS2339: Property 'job_id' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'."> | SelectQueryError<"column 'id' does not exist on 'users'."> | ... 15 more ... | SelectQueryError<...>'.
  Property 'job_id' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'.">'.

169         acc[view.job_id] = acc[view.job_id] || new Set()
                     ~~~~~~

src/hooks/use-realtime-analytics.ts:169:37 - error TS2339: Property 'job_id' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'."> | SelectQueryError<"column 'id' does not exist on 'users'."> | ... 15 more ... | SelectQueryError<...>'.
  Property 'job_id' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'.">'.

169         acc[view.job_id] = acc[view.job_id] || new Set()
                                        ~~~~~~

src/hooks/use-realtime-analytics.ts:170:18 - error TS2339: Property 'job_id' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'."> | SelectQueryError<"column 'id' does not exist on 'users'."> | ... 15 more ... | SelectQueryError<...>'.
  Property 'job_id' does not exist on type 'SelectQueryError<"column 'id' does not exist on 'account_deletion_requests'.">'.

170         acc[view.job_id].add(key)
                     ~~~~~~

src/hooks/use-realtime-analytics.ts:256:15 - error TS2769: No overload matches this call.
  Overload 1 of 2, '(relation: "account_deletion_requests" | "users" | "analytics_events" | "applications" | "job_listings" | "connection_history" | "conversations" | "file_uploads" | "job_assignments" | ... 8 more ... | "user_activity_summary"): PostgrestQueryBuilder<...>', gave the following error.
    Argument of type '"job_views"' is not assignable to parameter of type '"account_deletion_requests" | "users" | "analytics_events" | "applications" | "job_listings" | "connection_history" | "conversations" | "file_uploads" | "job_assignments" | ... 8 more ... | "user_activity_summary"'.
  Overload 2 of 2, '(relation: "top_performers" | "popular_jobs"): PostgrestQueryBuilder<{ Tables: { account_deletion_requests: { Row: { id: string; processed_at: string; processed_by_id: string; reason: string; requested_at: string; user_id: string; }; Insert: { ...; }; Update: { ...; }; Relationships: [...]; }; ... 16 more ...; users: { ...; }; }; Views: { ...; }; Functions: { ...; }; Enums: { ...; }; CompositeTypes: { ...; }; }, { ...; } | { ...; }, "top_performers" | "popular_jobs", [] | [...]>', gave the following error.
    Argument of type '"job_views"' is not assignable to parameter of type '"top_performers" | "popular_jobs"'.

256         .from('job_views')
                  ~~~~~~~~~~~


src/hooks/use-realtime-analytics.ts:258:23 - error TS2589: Type instantiation is excessively deep and possibly infinite.

258         .in('job_id', userJobs.map(j => j.id))
                          ~~~~~~~~~~~~~~~~~~~~~~~

src/hooks/use-realtime-analytics.ts:261:18 - error TS2339: Property 'job_id' does not exist on type 'SelectQueryError<"column 'job_id' does not exist on 'account_deletion_requests'."> | SelectQueryError<"column 'job_id' does not exist on 'users'."> | ... 15 more ... | SelectQueryError<...>'.
  Property 'job_id' does not exist on type 'SelectQueryError<"column 'job_id' does not exist on 'account_deletion_requests'.">'.

261         acc[view.job_id] = (acc[view.job_id] || 0) + 1
                     ~~~~~~

src/hooks/use-realtime-analytics.ts:261:38 - error TS2339: Property 'job_id' does not exist on type 'SelectQueryError<"column 'job_id' does not exist on 'account_deletion_requests'."> | SelectQueryError<"column 'job_id' does not exist on 'users'."> | ... 15 more ... | SelectQueryError<...>'.
  Property 'job_id' does not exist on type 'SelectQueryError<"column 'job_id' does not exist on 'account_deletion_requests'.">'.

261         acc[view.job_id] = (acc[view.job_id] || 0) + 1
                                         ~~~~~~

src/hooks/use-supabase-realtime-chat-backup.ts:56:28 - error TS2554: Expected 1 arguments, but got 0.

56   const typingTimeoutRef = useRef<NodeJS.Timeout>()
                              ~~~~~~

  node_modules/@types/react/index.d.ts:1728:24
    1728     function useRef<T>(initialValue: T): RefObject<T>;
                                ~~~~~~~~~~~~~~~
    An argument for 'initialValue' was not provided.

src/hooks/use-supabase-realtime-chat-backup.ts:112:19 - error TS2345: Argument of type '{ attachment_url: string; content: string; conversation_id: string; created_at: string; id: string; message_type: string; read_by: string[]; sender_avatar_url: string; sender_id: string; sender_name: string; }[]' is not assignable to parameter of type 'SetStateAction<Message[]>'.
  Type '{ attachment_url: string; content: string; conversation_id: string; created_at: string; id: string; message_type: string; read_by: string[]; sender_avatar_url: string; sender_id: string; sender_name: string; }[]' is not assignable to type 'Message[]'.
    Type '{ attachment_url: string; content: string; conversation_id: string; created_at: string; id: string; message_type: string; read_by: string[]; sender_avatar_url: string; sender_id: string; sender_name: string; }' is not assignable to type 'Message'.
      Types of property 'message_type' are incompatible.
        Type 'string' is not assignable to type '"text" | "image" | "file"'.

112       setMessages(data || [])
                      ~~~~~~~~~~

src/hooks/use-supabase-realtime-chat-fixed.ts:129:19 - error TS2345: Argument of type '{ attachment_url: string; content: string; conversation_id: string; created_at: string; id: string; message_type: string; read_by: string[]; sender_avatar_url: string; sender_id: string; sender_name: string; }[]' is not assignable to parameter of type 'SetStateAction<Message[]>'.
  Type '{ attachment_url: string; content: string; conversation_id: string; created_at: string; id: string; message_type: string; read_by: string[]; sender_avatar_url: string; sender_id: string; sender_name: string; }[]' is not assignable to type 'Message[]'.
    Type '{ attachment_url: string; content: string; conversation_id: string; created_at: string; id: string; message_type: string; read_by: string[]; sender_avatar_url: string; sender_id: string; sender_name: string; }' is not assignable to type 'Message'.
      Types of property 'message_type' are incompatible.
        Type 'string' is not assignable to type '"text" | "image" | "file"'.

129       setMessages(data || [])
                      ~~~~~~~~~~

src/hooks/use-supabase-realtime-chat-fixed.ts:198:19 - error TS2345: Argument of type '(prev: Message[]) => ({ attachment_url: string; content: string; conversation_id: string; created_at: string; id: string; message_type: string; read_by: string[]; sender_avatar_url: string; sender_id: string; sender_name: string; } | Message)[]' is not assignable to parameter of type 'SetStateAction<Message[]>'.
  Type '(prev: Message[]) => ({ attachment_url: string; content: string; conversation_id: string; created_at: string; id: string; message_type: string; read_by: string[]; sender_avatar_url: string; sender_id: string; sender_name: string; } | Message)[]' is not assignable to type '(prevState: Message[]) => Message[]'.
    Type '({ attachment_url: string; content: string; conversation_id: string; created_at: string; id: string; message_type: string; read_by: string[]; sender_avatar_url: string; sender_id: string; sender_name: string; } | Message)[]' is not assignable to type 'Message[]'.
      Type '{ attachment_url: string; content: string; conversation_id: string; created_at: string; id: string; message_type: string; read_by: string[]; sender_avatar_url: string; sender_id: string; sender_name: string; } | Message' is not assignable to type 'Message'.
        Type '{ attachment_url: string; content: string; conversation_id: string; created_at: string; id: string; message_type: string; read_by: string[]; sender_avatar_url: string; sender_id: string; sender_name: string; }' is not assignable to type 'Message'.
          Types of property 'message_type' are incompatible.
            Type 'string' is not assignable to type '"text" | "image" | "file"'.

198       setMessages(prev => prev.map(msg =>
                      ~~~~~~~~~~~~~~~~~~~~~~~
199         msg.id === tempMessage.id ? data : msg
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
200       ))
    ~~~~~~~

src/hooks/use-supabase-realtime-chat-postgres.ts:116:35 - error TS2339: Property 'deleted_by_users' does not exist on type 'SelectQueryError<"column 'deleted_by_users' does not exist on 'messages'.">'.

116         const deletedBy = message.deleted_by_users || []
                                      ~~~~~~~~~~~~~~~~

src/hooks/use-supabase-realtime-chat-postgres.ts:122:23 - error TS2353: Object literal may only specify known properties, and 'deleted_by_users' does not exist in type '{ attachment_url?: string; content?: string; conversation_id?: string; created_at?: string; id?: string; message_type?: string; read_by?: string[]; sender_avatar_url?: string; sender_id?: string; sender_name?: string; }'.

122             .update({ deleted_by_users: deletedBy })
                          ~~~~~~~~~~~~~~~~

src/hooks/use-supabase-realtime-chat-postgres.ts:123:31 - error TS2339: Property 'id' does not exist on type 'SelectQueryError<"column 'deleted_by_users' does not exist on 'messages'.">'.

123             .eq('id', message.id)
                                  ~~

src/hooks/use-supabase-realtime-chat-postgres.ts:151:39 - error TS2339: Property 'hidden_for_users' does not exist on type 'SelectQueryError<"column 'hidden_for_users' does not exist on 'conversations'.">'.

151       const hiddenFor = conversation?.hidden_for_users || []
                                          ~~~~~~~~~~~~~~~~

src/hooks/use-supabase-realtime-chat-postgres.ts:157:21 - error TS2353: Object literal may only specify known properties, and 'hidden_for_users' does not exist in type '{ application_id?: string; created_at?: string; created_by_id?: string; id?: string; is_active?: boolean; job_id?: string; last_message_at?: string; last_message_preview?: string; last_sender_id?: string; ... 6 more ...; updated_at?: string; }'.

157           .update({ hidden_for_users: hiddenFor })
                        ~~~~~~~~~~~~~~~~

src/hooks/use-supabase-realtime-chat-postgres.ts:187:34 - error TS2339: Property 'deleted_by_users' does not exist on type 'SelectQueryError<"column 'deleted_by_users' does not exist on 'messages'.">'.

187       const deletedBy = message?.deleted_by_users || []
                                     ~~~~~~~~~~~~~~~~

src/hooks/use-supabase-realtime-chat-postgres.ts:193:21 - error TS2353: Object literal may only specify known properties, and 'deleted_by_users' does not exist in type '{ attachment_url?: string; content?: string; conversation_id?: string; created_at?: string; id?: string; message_type?: string; read_by?: string[]; sender_avatar_url?: string; sender_id?: string; sender_name?: string; }'.

193           .update({ deleted_by_users: deletedBy })
                        ~~~~~~~~~~~~~~~~

src/hooks/use-supabase-realtime-chat-postgres.ts:240:41 - error TS2339: Property 'hidden_for_users' does not exist on type '{ application_id: string; created_at: string; created_by_id: string; id: string; is_active: boolean; job_id: string; last_message_at: string; last_message_preview: string; last_sender_id: string; ... 6 more ...; updated_at: string; }'.

240             const hiddenForUsers = conv.hidden_for_users || []
                                            ~~~~~~~~~~~~~~~~

src/hooks/use-supabase-realtime-chat-postgres.ts:289:38 - error TS2339: Property 'deleted_by_users' does not exist on type '{ attachment_url: string; content: string; conversation_id: string; created_at: string; id: string; message_type: string; read_by: string[]; sender_avatar_url: string; sender_id: string; sender_name: string; }'.

289           const deletedByUsers = msg.deleted_by_users || []
                                         ~~~~~~~~~~~~~~~~

src/lib/supabase-server.ts:157:14 - error TS2339: Property 'userData' does not exist on type 'User | { userData: { applications_received: number; applications_sent: number; avatar_url: string; average_rating: number; bio: string; company_name: string; connections: number; connections_last_refresh: string; ... 38 more ...; website: string; }; ... 24 more ...; deleted_at?: string; }'.
  Property 'userData' does not exist on type 'User'.

157   if (!user?.userData) {
                 ~~~~~~~~

src/lib/supabase-server.ts:161:12 - error TS2339: Property 'userData' does not exist on type 'User | { userData: { applications_received: number; applications_sent: number; avatar_url: string; average_rating: number; bio: string; company_name: string; connections: number; connections_last_refresh: string; ... 38 more ...; website: string; }; ... 24 more ...; deleted_at?: string; }'.
  Property 'userData' does not exist on type 'User'.

161   if (user.userData.role !== requiredRole && user.userData.role !== 'admin') {
               ~~~~~~~~

src/lib/supabase-server.ts:161:51 - error TS2339: Property 'userData' does not exist on type 'User | { userData: { applications_received: number; applications_sent: number; avatar_url: string; average_rating: number; bio: string; company_name: string; connections: number; connections_last_refresh: string; ... 38 more ...; website: string; }; ... 24 more ...; deleted_at?: string; }'.
  Property 'userData' does not exist on type 'User'.

161   if (user.userData.role !== requiredRole && user.userData.role !== 'admin') {
                                                      ~~~~~~~~


Found 58 errors in 15 files.

Errors  Files
     4  src/components/dashboard/tasker/job-applications-manager.tsx:22
     1  src/components/jobs/job-post-form.tsx:81
     2  src/components/jobs/job-post-form/job-cost-info.tsx:24
     1  src/components/jobs/job-post-form/review-step.tsx:70
     1  src/components/jobs/job/job-application-sidebar.tsx:42
     5  src/hooks/queries/useApplications.ts:13
     6  src/hooks/queries/useStaticData.ts:15
     4  src/hooks/use-ai-job-matching.ts:118
     4  src/hooks/use-email-system.ts:53
     1  src/hooks/use-misc-apis.ts:117
    13  src/hooks/use-realtime-analytics.ts:120
     2  src/hooks/use-supabase-realtime-chat-backup.ts:56
     2  src/hooks/use-supabase-realtime-chat-fixed.ts:129
     9  src/hooks/use-supabase-realtime-chat-postgres.ts:116
     3  src/lib/supabase-server.ts:157
