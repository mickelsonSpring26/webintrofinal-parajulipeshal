# SmartForecaster — Urban Agriculture Suite

## What I Want to Build

SmartForecaster is a crop management app for small-scale farmers. The core idea is that farmers shouldn't have to keep track of everything in their head or on paper. When they planted something, when it needs water next, what stage it's in. You enter your crops, set your reminders, and the app keeps track of it all for you. It shows you a dashboard of everything on your farm and flags whatever needs attention soon.

I want to build this because it's practical and pretty close to something real farmers could actually use. The project is big enough to be challenging since I'm managing multiple crops with different planting dates, growth stages, and reminder schedules all in one place, but still focused enough that I can build something that actually works well by the end of the month. I also think it'll be good practice designing around real user needs.

The app lets a farmer enter their name to get to their personal dashboard, then add crops with a type, planting date, and field location. From the planting date, the app calculates what growth stage each crop is in right now and shows a progress bar. Farmers can set watering and fertilizer reminders on a schedule, and the app tracks when each one is next due. The dashboard lists all crops at a glance and highlights anything that's coming up soon or overdue.

---

## Weekly Plan

### April 01 — 15%

- [ ] A user can enter their name to get to their personal farm dashboard
- [ ] A user can add a crop using a form with crop type (select), planting date, field location (text), and quantity (number)
- [ ] A user can see a list of all their crops on the dashboard
- [ ] A user can delete a crop from their farm
- [ ] A user can navigate between pages using a shared nav bar with a header and footer on every page

---

### April 04 — 30%

- [ ] A user can see the current growth stage of each crop based on when it was planted
- [ ] A user can see a progress bar showing how far along a crop is from planting to harvest
- [ ] A user can upload a photo when adding a crop and see it displayed on the crop card inside a figure element with a caption
- [ ] A user can edit the details of a crop they already added
- [ ] A user can reset the add crop form using a reset button to clear all fields

---

### April 08 — 40%

- [ ] A user can set a watering reminder for a crop by choosing how often to water it
- [ ] A user can set a fertilizer reminder with its own separate schedule
- [ ] A user can see the next due date for watering and fertilizing each crop
- [ ] A user can mark a watering or fertilizer task as done and see the next due date update
- [ ] A user can see their crops and reminders saved in local storage so data persists on page refresh

---

### April 11 — 50%

- [ ] A user can filter the crop list by type, location, or attention status using a filter bar
- [ ] A user can drag and drop crops to reorder them on the dashboard
- [ ] A user can see weather info for their field location pulled from an external weather API
- [ ] A user can see which crops need attention highlighted on the dashboard
- [ ] A user can see a list of upcoming tasks in a structured list on the dashboard

---

### April 15 — 70%

- [ ] A user can click a crop and go to a detail page with its stage, reminders, notes, and photo
- [ ] A user can see crop details passed through the URL query string when navigating to the detail page
- [ ] A user can add notes to a crop to track observations over time
- [ ] A user can see tips or alerts displayed in an aside element alongside the main crop content
- [ ] A user can see crop articles organized in section and article elements across the dashboard

---

### April 18 — 80%

- [ ] A user can see their crop data fetched from and saved to a custom back-end API
- [ ] A user can see the app still work when they return later because data is stored on the server
- [ ] A user can see smooth hover effects and transitions when interacting with buttons and cards
- [ ] A user can see the layout rearrange properly on mobile screens

---

### April 22 — 90%

- [ ] A user can see a clear empty state message when they have no crops yet
- [ ] A user can see loading and error states when the API does not respond
- [ ] A user can see consistent colors across the app using CSS variables for background, text, and accent colors
- [ ] A user can use the app comfortably on both desktop and mobile

---

## Requirements Coverage

| Requirement | Where it is fulfilled |
|---|---|
| HTML: form inputs (text, number, select, reset, submit) | Add/edit crop form (week 1) |
| HTML: img, figure, a, ul/ol, section/article, aside, nav | Crop cards, detail page, dashboard (weeks 1–5) |
| CSS: flex/grid, hover, transitions, nth-child, variables, contrast | All pages throughout |
| JS: map, filter, DOM manipulation, event listeners, modules | Crop list rendering and filter bar (weeks 1–4) |
| JS: async/await, external API network call | Weather data fetch (week 4) |
| JS: local storage | Crop and reminder persistence (week 3) |
| JS: read query string | Crop detail page navigation (week 5) |
| JS: structured layers (ui, domain, svc) | Across all JS files throughout |
| Multiple pages | Dashboard, add crop, crop detail, reminders (weeks 1–5) |
| Filter bar | Crop list filter by type/location/status (week 4) |
| Drag and drop | Reorder crops on dashboard (week 4) |
| Shared page layout | Header, footer, nav on every page (week 1) |
| Custom back-end API | Crop and reminder data storage (week 6) |
| Host back-end on cloud | Deploy API to cloud server (week 6) |