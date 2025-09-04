# 🛠 Technology Roadmap – Next Performer (MVP Build)  
**Version:** v1  
**Date:** 2025-08-31  

---

## ⚙️ Core Tech Stack
- **Frontend:** React / Next.js (mobile-first PWA)  
- **Backend:** Node.js / Express (REST API)  
- **Database:** PostgreSQL (DigitalOcean managed instance)  
- **Hosting:** DigitalOcean Droplet ($50/mo)  
- **Auth:** JWT-based email login  
- **Notifications:** Email (SendGrid/Mailgun) in MVP; SMS later  
- **Payments:** Stripe (for Pro Hosts & Venues)  

---

## 📅 12-Week Sprint Breakdown  

### **Phase 1 – Foundation (Weeks 1–2)**
- Set up repo + CI/CD pipeline (GitHub Actions → DigitalOcean).  
- Configure PostgreSQL schema: Users, Hosts, Venues, Events, Signups.  
- Build basic auth (email/password, JWT).  
- Landing page skeleton: “Find open mics near you” search bar.  

✅ Deliverable: Deployed skeleton app with auth + DB on DigitalOcean.  

---

### **Phase 2 – Performer Signups (Weeks 3–4)**
- Event creation form (host side).  
- Event listing & detail page (performer side).  
- Performer signup workflow (choose slot).  
- Prevent slot conflicts (basic validation).  

✅ Deliverable: Performers can sign up for slots at events created by hosts.  

---

### **Phase 3 – Host Tools (Weeks 5–6)**
- Host dashboard: view/manage event lineup.  
- Edit lineup order, drop/replace slots.  
- Export/download lineup (CSV/email).  
- Add “Free vs Pro” tier logic (limit free hosts to 1 event).  

✅ Deliverable: Hosts can run events with a usable digital lineup tool.  

---

### **Phase 4 – Payments & Subscriptions (Weeks 7–8)**
- Stripe integration for Hosts ($10/mo Pro).  
- Stripe integration for Venues ($50/mo sponsorship).  
- Subscription tier enforcement.  
- Admin dashboard (basic): view users, events, payments.  

✅ Deliverable: Paid tier + subscription flow live.  

---

### **Phase 5 – Notifications & UX Polish (Weeks 9–10)**
- Email notifications (signup confirmation, reminders).  
- Waitlist functionality (auto-promote when slots open).  
- Mobile UX polish (optimize for small screens).  
- Add analytics hooks (Mixpanel/GA).  

✅ Deliverable: Polished MVP with notifications + host-friendly UX.  

---

### **Phase 6 – Pilot Prep & Launch (Weeks 11–12)**
- Seed Jacksonville events (manually add 10–20 recurring open mics).  
- Onboard 3–5 pilot venues + hosts.  
- Add pilot landing page (“Jacksonville Open Mics – Sign Up Now”).  
- Run small marketing test ($500 FB/IG ads).  

✅ Deliverable: **Jacksonville pilot live**, real hosts + performers using app.  

---

## 🚀 Post-MVP Roadmap (After Pilot)
- Native mobile apps (React Native or Expo).  
- Performer profiles + ratings.  
- Venue discovery map.  
- SMS notifications (Twilio).  
- Referral program (hosts invite other hosts).  
