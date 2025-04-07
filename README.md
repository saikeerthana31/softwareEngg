#  Lab Utilizaton and Booking Application - TEAM A1

<b> Epic 1: User Authentication and Profile Management </b>

<ul>
 <li>Account creation and login functionality were implemented successfully with strong password encryption and input validation. </li>
 <li>Profile management allowed users to update their personal data securely and easily. </li>
 <li>The validation mechanisms helped reduce garbage input and improved overall form reliability. </li>
</ul>

<img width="625" alt="Screenshot 2025-04-07 at 10 41 46 PM" src="https://github.com/user-attachments/assets/22abd3ae-bf7c-4914-8c29-8d3ef5ec5c77" />
<img width="625" alt="Screenshot 2025-04-07 at 10 42 07 PM" src="https://github.com/user-attachments/assets/118bd767-4b77-4cb3-900d-49b60e956bcb" />
<img width="625" alt="Screenshot 2025-04-07 at 10 42 19 PM" src="https://github.com/user-attachments/assets/1365151e-1062-45e4-b078-75feb0b294d8" />


<b> Epic 2: Lab Booking System </b>

<ul>
 <li>The interface for browsing and booking labs was completed successfully with intuitive UI. </li>
 <li>Conflict handling ensured that double bookings were avoided. </li>
 <li>Confirmation messages and email-based notifications were functional and well-received during testing. </li>
</ul>

*STAFF SIDE*:


<img width="625" alt="Screenshot 2025-04-07 at 10 42 40 PM" src="https://github.com/user-attachments/assets/814b2edc-027c-4c66-99af-c553db789b38" />
<img width="625" alt="Screenshot 2025-04-07 at 10 42 53 PM" src="https://github.com/user-attachments/assets/99017083-9ff4-441b-99fe-2d2d32dca18c" />
<img width="625" alt="Screenshot 2025-04-07 at 10 43 02 PM" src="https://github.com/user-attachments/assets/ce234c6a-9435-4ee0-b778-3bf3bd36979d" />


*STUDENT SIDE*:


<img width="625" alt="Screenshot 2025-04-07 at 10 43 48 PM" src="https://github.com/user-attachments/assets/c197a83e-f70f-4a29-8ab6-69b536327c31" />
<img width="625" alt="Screenshot 2025-04-07 at 10 43 59 PM" src="https://github.com/user-attachments/assets/ada95db2-c0eb-4ba7-8ad1-da48391b4b41" />
<img width="625" alt="Screenshot 2025-04-07 at 10 44 12 PM" src="https://github.com/user-attachments/assets/b11e5815-a032-415c-9d53-cdd53f0e6ddc" />
<img width="625" alt="Screenshot 2025-04-07 at 10 44 24 PM" src="https://github.com/user-attachments/assets/80ae655a-09c7-487b-8a91-76c7a6b5496b" />


<b> Epic 3: Lab Utilization Dashboard </b>

<ul>
 <li>A clean and informative dashboard was created using data visualization libraries. </li>
 <li>Users could see booking history and usage patterns, aiding in transparency. </li>
 <li>Admins could generate usage reports to assess demand and lab occupancy trends. </li>
</ul>

<img width="625" alt="Screenshot 2025-04-07 at 10 44 38 PM" src="https://github.com/user-attachments/assets/30579bfa-ec94-44c4-9669-ade69cbc5f73" />
<img width="625" alt="Screenshot 2025-04-07 at 10 44 52 PM" src="https://github.com/user-attachments/assets/43c3d1bc-ba3e-40e3-bac8-f900afa249ed" />
<img width="625" alt="Screenshot 2025-04-07 at 10 45 04 PM" src="https://github.com/user-attachments/assets/8831cd7e-f606-439f-a6ed-1dfd6878b649" />


<b> Epic 4: Lab Management for Administrators </b>

<ul>
 <li>Admin panel functionalities (add/edit/remove labs) worked smoothly. </li>
 <li>Proper input validation prevented invalid lab details and ensured consistency in lab data. </li>
</ul>

<img width="625" alt="Screenshot 2025-04-07 at 10 45 16 PM" src="https://github.com/user-attachments/assets/97b083eb-388b-47c8-a19d-8baf8bcf0305" />
<img width="625" alt="Screenshot 2025-04-07 at 10 45 42 PM" src="https://github.com/user-attachments/assets/dcabb838-147c-47da-ba01-8dcbd5f925fa" />
<img width="625" alt="Screenshot 2025-04-07 at 10 45 55 PM" src="https://github.com/user-attachments/assets/6f5218d1-3154-4a7d-8245-ef2c1206e324" />


<b> Epic 5: Notification and Alert System </b>

<ul>
 <li>Notifications for booking confirmations and cancellations were successfully triggered via both in-app and email systems. </li>
 <li>The system ensured users were kept in the loop about changes to their bookings. </li>
</ul>

<img width="625" alt="Screenshot 2025-04-07 at 10 46 12 PM" src="https://github.com/user-attachments/assets/42598bca-7a1f-40b7-9388-c1b1831eb531" />

# Tech Stack Evaluation for a Full-Stack Application

*Overview*:
```
The proposed tech stack for a full-stack application comprises Node.js and React.js for the front-end, and Supabase and Mailgun for the back-end. This combination leverages modern, scalable, and efficient technologies tailored to the needs of a full-stack app. Below is an analysis of why this tech stack is advantageous, organized by component. 
```

<b> *Front-End: Node.js and React.js* </b>

*1. Node.js*
<ul>
 <li>JavaScript Runtime</li>
  <li>Efficient Build Tools</li>
  <li>Scalability</li>
  <li>Ecosystem </li>
</ul>

*2. React.js*
<ul>
 <li>Component-Based Architecture </li>
 <li>Virtual DOM</li>
 <li>Rich Ecosystem</li>
 <li>Community and Support</li>
 <li>Flexibility </li>
</ul>


<b>Why It Works Together: </b>

Node.js as the runtime complements React.js, enabling a JavaScript-centric workflow. This synergy simplifies tooling (e.g., dev servers) and supports isomorphic JavaScript (code sharing between client and server), enhancing efficiency and consistency. 

 
<b> *Back-End: Supabase and Mailgun* </b>
*1. Supabase*
<ul>
 <li>Open-Source BaaS </li>
  <li>Scalability</li>
  <li>Real-Time Features</li>
  <li>Developer Experience</li>
  <li>Cost-Effective</li>
</ul>


*2. Mailgun*
<ul>
 <li>Email Automation</li>
  <li>Reliability</li>
  <li>API Integration</li>
  <li>Analytics</li>
  <li>Scalability</li>
</ul>


<b>Why It Works Together </b>
Supabase manages core back-end functions (database, auth, APIs), while Mailgun offloads email tasks. This separation keeps the architecture lightweight, with Supabase handling data/logic and Mailgun ensuring reliable user communication. 
 
<b>Overall Benefits of the Tech Stack: </b>
<ul>
 <li><b> Unified JavaScript Workflow:</b> Node.js, React.js, and Supabase’s JS-friendly APIs enable code reuse and reduce the learning curve. </li>
 <li><b> Rapid Development:</b>  React’s components, Supabase’s pre-built features, and Mailgun’s email solution minimize setup time, focusing effort on app logic and UX. </li>
 <li><b> Scalability:</b>  Node.js (event-driven), React (efficient rendering), Supabase (PostgreSQL-based), and Mailgun (email volume) scale with demand. </li>
 <li><b> Cost Efficiency: </b> Open-source tools (Node.js, React.js, Supabase) and affordable services (Mailgun) keep costs low, especially for MVPs or small-to-medium apps. </li>
 <li><b> Modern and Future-Proof: </b> Widely adopted and actively maintained, this stack ensures compatibility with future trends and libraries. </li>
</ul>


# Bug Density Evaluation 
*Calculation*:
```
Total Bugs: 18 
Total Lines of Code (LOC): 32,000 
Bug Density Formula: (Total Bugs / Total LOC) × 1000 
Result: (18 / 32,000) × 1000 = 0.5625 bugs per 1000 LOC 
```
<ul>
 <li>A bug density of 0.56 bugs per 1000 LOC is considered very good. </li>
 <li><b>Code Stability:</b> Indicates a reliable and robust codebase. </li>
 <li><b>Fewer Defects:</b>  Low defect rate relative to the codebase size. </li>
 <li><b>Good Testing Practices: </b> Suggests effective testing processes are in place. </li>
 <li><b>Decent Architecture:</b>  Likely reflects well-structured and maintainable code. </li>
</ul>
