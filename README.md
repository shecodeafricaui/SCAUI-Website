# SCAUI Connect Hub

Hi, optimize this to look more professional, free and engaging. We need all backend processes fully functional. Member signin, attached is the membership form details, create a unique page for each member and on first signin, their password is scaui, but they get to change their password after signing up.

Authentication & authorization

You need different access levels.

Public

Can:

 View website

 View programmes

 View projects

 View opportunities

 View events

 Join SCAUI

 Subscribe to newsletter

 Contact SCAUI

Member

Can:

 Log in

 View/edit profile

 Register for events

 Join projects

 Apply for programmes

 View their attendance

 View opportunities

 Join volunteer teams

 View their achievements

Team Lead

Can:

 Manage assigned programmes/projects

 View relevant members

 Record attendance

 Submit reports

 Create/update assigned content

Admin / Chapter Lead

Can:

 Manage members

 Manage events

 Manage programmes

 Manage projects

 Manage opportunities

 Manage teams

 Manage newsletter

 Manage applications

 Manage attendance

 Manage website content

 View analytics

Super Admin

Can additionally:

 Manage administrators

 Manage permissions

 Manage system settings

 Manage integrations

3. Event management

This is one of the most important backend systems.

Admin creates event → Members register → Confirmation → Event happens → Attendance recorded → Participation added to member profile

Backend processes:

 Create event

 Edit event

 Publish/unpublish event

 Event registration

 Registration limits

 Waitlist

 Registration confirmation

 Event reminders

 Attendance tracking

 QR-code attendance

 Manual attendance

 Post-event feedback

 Event reports

 Event photos/resources

 Event cancellation

 Event history

You could eventually have:

Scan QR → identify member → mark attendance automatically.

That would make your 5-meeting requirement much easier to manage.

4. Attendance & engagement system

Because you want the minimum 5 SCAUI activities, this deserves its own backend module.

Every participation can generate an engagement record.

For example:

Oyindamola
├── Intro to Tech — Attended
├── AI Engineering — Attended
├── Portfolio Lab — Attended
├── SCAUI Hangout — Attended
└── Community Project — Attended

Backend processes:

 Record attendance

 Record volunteering

 Record project participation

 Record programme participation

 Calculate participation count

 Determine active/inactive status

 Generate engagement history

 Send reminders to inactive members

 Generate engagement reports

You don't necessarily need a complicated points system initially.

5. Programme management

For things like:

 Intro to Tech

 Career Pathways

 AI Engineering

 DataCamp cohort

 Portfolio sessions

 Mentorship programmes

Backend:

 Create programme

 Programme description

 Programme category

 Start/end dates

 Facilitators

 Eligibility criteria

 Application form

 Application submission

 Application review

 Acceptance/rejection

 Participant list

 Attendance

 Programme resources

 Completion status

 Certificates

 Programme feedback

 Programme reports

6. Learning / track management

Your identified clusters could become backend entities:

Design
 ├── Graphics Design
 └── UI/UX

Software Engineering
 ├── Frontend
 ├── Backend
 └── Mobile

Data & AI
 ├── Data Analysis
 ├── Data Science
 └── AI/ML

Product & Business
 ├── Product Management
 ├── Project Management
 └── Marketing

Emerging Tech
 ├── Cybersecurity
 └── Blockchain

Backend processes:

 Create track

 Assign track lead

 Add learning resources

 Add members to tracks

 Track member progress

 Track sessions

 Track projects

 Track facilitators

 Track cohort members

This also enables:

"Show me all SCAUI members interested in AI/ML."

7. Projects system

I would definitely include this.

For example:

SCAUI Website

Members:

 Developer

 UI/UX designer

 Graphics designer

 Product manager

 Content writer

 Data/analytics person

 QA

Backend processes:

 Create project

 Project description

 Project lead

 Project team

 Open roles

 Member applications

 Application approval

 Project status

 Tasks

 Milestones

 Resources

 Project documentation

 Completion

 Showcase/project publication

This turns SCAUI from:

"We teach tech."

into:

"We help women learn, build and demonstrate real-world skills."

8. Opportunity board

This could become one of the most valuable sections.

Admin/team members can post:

 Internships

 Jobs

 Scholarships

 Fellowships

 Hackathons

 Competitions

 Grants

 Conferences

 Courses

 Certifications

 Volunteer opportunities

Backend:

 Create opportunity

 Category

 Deadline

 Eligibility

 Location

 Remote/on-site

 Application URL

 Featured opportunity

 Expiration date

 Save/bookmark

 Track clicks

 Automatically archive expired opportunities

You could eventually personalize it:

"Based on your interests in AI/ML and Data Science, here are 7 opportunities."

9. Newsletter system

Since you want weekly newsletters, don't make this manually dependent on WhatsApp.

Backend:

 Subscriber management

 Member subscription

 Newsletter creation

 Newsletter drafts

 Scheduled sending

 Recipient segmentation

 Track opens

 Track clicks

 Unsubscribe

 Newsletter archive

Potential segments:

All members
AI/ML members
Design members
Final-year students
New members
Active members
Alumni
Volunteers

10. Member spotlight system

For your planned Member Spotlight feature:

Backend:

 Select member

 Spotlight title

 Member story

 Profile photo

 Tech journey

 Achievements

 Social links

 Interview/questions

 Publish/unpublish

 Featured spotlight

Could automatically appear on the homepage.

11. Birthday system

Since you want birthday flyers:

Backend stores:

Member
Birthday
Birthday month/day
Birthday visibility preference

Then a scheduled process checks birthdays daily.

Example:

Every morning at 7:00 AM

Find members whose birthday = today
        ↓
Generate birthday notification
        ↓
Notify SCAUI content/design team

Eventually you could automate birthday graphics too.

12. Volunteer/team management

This is particularly important given your current restructuring.

Backend:

 Create team

 Team description

 Team lead

 Team members

 Open positions

 Volunteer application

 Application review

 Assign member

 Remove member

 Team activity

 Team reports

Teams could be:

 Programs

 Design

 Content

 Publicity

 Welfare

 Sponsorship

 Technical/Tracks

 Community Operations

13. Mentorship system

If you introduce mentorship later:

Mentor registers → Admin approves → Mentor profile → Mentee applies → Matching → Mentorship begins

Backend:

 Mentor profiles

 Mentor expertise

 Mentee profiles

 Applications

 Matching

 Availability

 Session tracking

 Mentor/mentee communication links

 Feedback

 Completion

You don't need to build this for V1, but structure the database so it can be added later.

14. Sponsorship & partnership management

For SCAUI's growth:

Backend could track:

Partner
├── Company
├── Contact
├── Email
├── Phone
├── Partnership type
├── Status
├── Proposal
├── Amount/value
├── Start date
├── End date
└── Notes

Statuses:

 Prospect

 Contacted

 Meeting

 Proposal sent

 Negotiation

 Active

 Completed

 Declined

This becomes a mini CRM for SCAUI.

15. Donation / payment system

Not necessarily V1, but eventually:

 Donations

 Sponsorship payments

 Programme fees (if any)

 Event payments

 Payment verification

 Receipts

 Transaction history

 Financial reports

For example, if someone sponsors:

"One SCAUI Leadership Position — ₦120,000/year"

the backend could record the sponsorship and its associated programme/team.

16. Content management system

Instead of hardcoding everything into the frontend:

Admin should be able to manage:

 Announcements

 Blog posts

 Member spotlights

 Events

 Opportunities

 Projects

 Programmes

 Resources

 FAQs

 Team members

Basically, your admin dashboard becomes the CMS.

17. Contact / enquiries

Backend:

Visitor
 ↓
Contact form
 ↓
Database
 ↓
Admin notification
 ↓
Admin responds
 ↓
Status = Resolved

Fields:

 Name

 Email

 Subject

 Message

 Category

 Status

 Assigned admin

 Created date

18. Notifications

I'd create a central notification system rather than individually coding notifications for every feature.

It could support:

Email

 Registration confirmation

 Event reminder

 Programme acceptance

 Newsletter

 Opportunity alerts

In-app

 New programme

 Event reminder

 Project invitation

 Application status

WhatsApp

Potentially later through a WhatsApp API.

19. Automated scheduled jobs

This is where your backend starts becoming genuinely powerful.

A scheduler/cron system can run things like:

Every day
 ├── Check birthdays
 ├── Check expiring opportunities
 ├── Check upcoming events
 └── Send reminders

Every week
 ├── Generate opportunity digest
 ├── Prepare newsletter
 └── Engagement report

Every month
 ├── Member engagement report
 ├── Attendance report
 ├── Team performance report
 └── Programme report

20. Analytics

Admin dashboard should answer:

Community

 Total members

 Active members

 New members

 Members by faculty

 Members by level

 Members by track

Engagement

 Attendance

 Active members

 Volunteer participation

 Project participation

 5-activity threshold

Programmes

 Registrations

 Attendance

 Completion

 Feedback

Opportunities

 Opportunities posted

 Clicks

 Most viewed opportunities

Growth

 Members this month

 Members this semester

 Retention

21. Search & filtering

Very useful once you have 100+ members.

Admin should be able to search:

"Find 200-level students interested in AI/ML who volunteered for Programs."

Backend query:

Level = 200
AND
Interest = AI/ML
AND
Volunteer Team = Programs

This is why your database structure matters.

22. Audit logs

For an organisation that changes leadership every year, this is surprisingly important.

Record:

Who
Did what
When

For example:

Admin A changed Jane's membership status from Active → Alumni.

or:

Programs Lead published "Intro to AI Engineering".

This protects the organisation and helps the next Chapter Lead understand what happened.

23. File/document management

Members and admins may need to upload:

 Profile pictures

 Certificates

 Event resources

 Programme materials

 Project documents

 Partnership documents

Backend should handle:

 Upload

 Storage

 File metadata

 Permissions

 Deletion

 Download/access control

Don't store the actual files directly in your database.

24. Security

Non-negotiable backend processes:

 Password hashing

 Authentication

 Role-based access control

 Input validation

 Rate limiting

 API authentication

 Secure file uploads

 Email verification

 Password reset

 Session management

 CORS configuration

 Database backups

 Audit logs

 Protection against spam

 Protection against unauthorized admin access

And because you'll have phone numbers, emails and birthdays, privacy/access controls matter.

25. Data import/export

This is especially relevant to your current situation.

Admin should eventually be able to:

Import

CSV → Validate → Preview → Import → Members created

And:

Export

Members → Filter → Export CSV

So future Chapter Leads aren't trapped in the database.

26. The actual backend architecture

For your skillset, I'd keep the first version relatively simple:

                 SCAUI WEBSITE
                      │
                Next.js Frontend
                      │
                     API
                      │
             ┌────────┴────────┐
             │                 │
         PostgreSQL          Storage
             │                 │
      ┌──────┴──────┐       Images/files
      │             │
   Members       Programmes
   Events        Projects
   Teams         Opportunities
   Attendance    Newsletter
   etc.

And then:

Authentication
      │
      ↓
Role-based access
      │
      ↓
Admin Dashboard

For automated processes:

Backend
   ↓
Queue / Cron
   ↓
Email / WhatsApp / Notifications

What I'd actually build for SCAUI V1

Don't build all 25 systems before launching. That's how this becomes a 4-month project.

I'd divide it into:

V1 — Essential

 Authentication

 Member registration

 Member profiles

 Member directory

 Events

 Event registration

 Attendance

 Programmes

 Opportunities

 Volunteer teams

 Admin dashboard

 Notifications

 Newsletter

 Content management

 CSV import/export

V1.5 — Community engine

 Projects

 Track management

 Member spotlights

 Engagement tracking

 Certificates

 Birthday automation

 Analytics

V2 — Serious platform

 Mentorship

 Sponsorship CRM

 Payments/donations

 Advanced opportunity personalization

 WhatsApp automation

 Automated reports

 Advanced analytics

 Alumni system

We are building all the way to V2.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bbd6854e-a0fa-4d2e-bd40-e6f45481ef6d).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
