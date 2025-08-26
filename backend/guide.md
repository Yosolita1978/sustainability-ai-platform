Option 2: Using uv (Python 3.11+ recommended)
```bash
rm -rf .venv outputs/
pyenv local 3.11.9  # or your preferred Python 3.11+
uv venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
uv sync
python main.py
```

For testing the POST
```bash
curl -X POST "http://localhost:8000/api/training/start" \
  -H "Content-Type: application/json" \
  -d '{"industry_focus": "Agriculture", "regulatory_framework": "EU", "training_level": "Begginer"}'
  ```

```bash
curl -X POST "http://localhost:8000/api/training/start" \
  -H "Content-Type: application/json" \
  -d '{"industry_focus": "Technology", "regulatory_framework": "EU", "training_level": "Intermediate"}'
  ```

  # 🚀 ONE-DAY MVP PLAN - Sustainability Training Frontend

## ⏰ TODAY's Reality Check
**8 hours max** → **Client demo tomorrow** → **Focus on WORKING, not perfect**

---

## 🎯 MVP Scope (Cut Everything Non-Essential)

### ✅ MUST HAVE (Core Demo Flow)
1. **Landing page** - Simple form (4 fields) → Submit to backend
2. **Progress page** - Basic progress bar + status text
3. **Results page** - "Training Complete" + Download button

### ❌ CUT FOR V1 (Add Later)
- Complex animations
- Mobile optimization  
- Error handling edge cases
- Pretty UI components
- Progress step visualization
- Playbook preview

---

## 🏗️ 8-Hour Implementation Plan

### **Hour 1-2: Project Setup & Basic Structure**
```bash
npx create-next-app@latest frontend --typescript --tailwind --app-router
cd frontend && npm run dev
```

**Deliverable**: Working Next.js app with 3 empty pages

### **Hour 3-4: Form Page + API Integration**
- Simple form with 4 fields (industry, regulatory framework, training level, company name)
- Submit button → POST to backend → Store session ID in localStorage
- Basic Tailwind styling (clean, professional)

**Deliverable**: Form submits to backend and redirects to progress

### **Hour 5-6: Progress Page + Polling**
- Read session ID from localStorage
- Poll `/api/training/status/{id}` every 3 seconds
- Show progress percentage + current step text
- Redirect to results when complete

**Deliverable**: Real-time progress tracking works

### **Hour 7-8: Results Page + Deploy**
- Show "Training Complete" message
- Download button → `/api/training/download/{id}`
- Deploy to Vercel
- Test end-to-end flow

**Deliverable**: Complete working demo deployed online

---

## 📁 Minimal File Structure
```
frontend/src/
├── app/
│   ├── page.tsx          # Form page
│   ├── progress/page.tsx # Progress tracking  
│   ├── results/page.tsx  # Download results
│   └── layout.tsx        # Basic layout
├── lib/
│   ├── api.ts           # Axios calls to backend
│   └── types.ts         # TypeScript interfaces
└── components/
    └── ui/              # Copy 2-3 components from shadcn/ui
```

---

## 🎨 Design Strategy (Minimal but Professional)
- **Color scheme**: Simple blue/gray professional theme
- **Typography**: Default system fonts
- **Layout**: Centered cards, clean spacing
- **Components**: Just form inputs, buttons, progress bar
- **Responsive**: Desktop-first, basic mobile (don't perfect it)

---

## 🔧 Tech Stack (Fastest Path)
- **Framework**: Next.js 14 (app router)
- **Styling**: Tailwind CSS (built-in)
- **HTTP**: fetch() (built-in, no axios needed)
- **State**: localStorage + React useState (no context)
- **UI**: Raw HTML + Tailwind (no component library)

---

## 🚨 Critical Success Factors

### **Must Work Perfectly**:
1. Form submission creates session
2. Progress polling shows real updates  
3. Download button delivers playbook file
4. Deployed URL accessible to client

### **Can Be Basic**:
- Visual design (clean but simple)
- Error messages (basic alerts)
- Loading states (simple spinners)
- Mobile experience (functional but not polished)

---

## ⚡ Hour-by-Hour Execution

### **9 AM - 11 AM**: Setup + Form
- Create Next.js project
- Build form page with 4 input fields
- Connect to backend POST endpoint
- Test form submission works

### **11 AM - 1 PM**: Progress Page  
- Build progress page with polling
- Test with real backend training session
- Handle session completion redirect

### **1 PM - 3 PM**: Results + Polish
- Build download page
- Test file download works
- Add basic styling throughout
- Fix obvious bugs

### **3 PM - 5 PM**: Deploy + Test
- Deploy to Vercel
- Test complete user flow online
- Fix deployment issues
- Document demo flow for client

---

## 📋 Client Demo Prep (Tomorrow)

### **Demo Script** (5 minutes):
1. "This is our AI-powered sustainability training platform"
2. Fill out form → "Watch it generate custom training in real-time"
3. Show progress → "AI is analyzing regulations and creating content"
4. Download playbook → "Here's your comprehensive 50-page training guide"
5. Open downloaded file → "Completely customized for your business"

### **Demo Environment**:
- Live URL: https://your-frontend.vercel.app
- Test data ready: "Technology", "EU", "Intermediate"
- Backend stable and responding
- Downloaded playbook ready to show

---

## 🚧 Known Limitations (Be Honest)
- Basic visual design (not final)
- Desktop-optimized (mobile later)
- Minimal error handling
- No user accounts (MVP feature)
- Single session at a time

**Client Message**: "This is our working MVP demonstrating core functionality. Full UI/UX polish comes in the next sprint."

---

## 🎯 Success Definition
**By 5 PM today**: Client can visit live URL, submit form, watch progress, download real playbook. **DONE.**

This focuses entirely on proving the concept works end-to-end rather than making it pretty. You can polish the UI after you have a working demo that impresses the client.

---

## 📝 Implementation Checklist

### Setup Phase ✅
- [ ] Create Next.js project with TypeScript & Tailwind
- [ ] Set up basic routing structure
- [ ] Test backend API connection

### Core Features ✅
- [ ] Form page with 4 input fields
- [ ] API integration for training submission
- [ ] Progress page with real-time polling
- [ ] Results page with download functionality

### Deployment ✅
- [ ] Deploy to Vercel
- [ ] Configure environment variables
- [ ] Test complete user flow
- [ ] Prepare demo documentation

### Demo Prep ✅
- [ ] Create demo script
- [ ] Test with sample data
- [ ] Prepare client presentation
- [ ] Document known limitations

---

## 🚀 Quick Start Commands

```bash
# 1. Create the project
npx create-next-app@latest frontend --typescript --tailwind --app-router

# 2. Navigate and start development
cd frontend
npm run dev

# 3. Install additional dependencies if needed
npm install

# 4. Deploy to Vercel (when ready)
npx vercel --prod
```

---

## 📞 Emergency Fallback Plan

If anything goes wrong:
1. **Backend issues**: Use mock responses for demo
2. **Deployment issues**: Run locally and screen share
3. **Styling issues**: Focus on functionality over aesthetics
4. **Time crunch**: Cut Results page, just show progress completion

**Remember**: A working basic demo beats a broken pretty one.