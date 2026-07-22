ASSETS FOLDER GUIDE
====================

Drop your real photos into these folders, matching the "image" path
already written for each person/event in data.json:

assets/images/logo/         -> gucpc-logo.png, sbg-logo.png (site header)
assets/images/core-team/    -> photos for core team members
assets/images/volunteers/   -> photos for volunteers
assets/images/speakers/     -> photos for guest speakers
assets/images/events/       -> photos for each event card

HOW THE "PHOTO" PLACEHOLDER WORKS
----------------------------------
Every place a photo will eventually go currently shows a small dashed
box with the word "Photo" — that's this element:

    <div class="photo-placeholder">Photo</div>

To add a real photo, replace that whole div with an <img>, e.g.:

    <img src="assets/images/core-team/rahul.jpg" alt="Rahul Patel" />

Once you do that, the placeholder box disappears automatically —
there's nothing else to change in the CSS or JS.

FOR TEAM MEMBERS AND EVENTS (data.json driven)
------------------------------------------------
team.js and events.js currently render the placeholder box for every
card. Once you're ready to wire up real photos there too, open
js/team.js or js/events.js and swap this line in each card template:

    <div class="photo-placeholder">Photo</div>

for:

    <img src="${person.image}" alt="${person.name}" />

(the "image" field already exists on every entry in data.json).

HEADER LOGOS
------------
In every HTML file's <header>, the GUCPC and Student Builder Group
logos are placeholder badges:

    <div class="logo-badge">GUCPC</div>
    <div class="logo-badge">SBG</div>

Replace each with an <img src="assets/images/logo/your-logo.png" ... />
once you have the real logo files.
