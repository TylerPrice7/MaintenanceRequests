# MaintenanceRequests
A mock maintenance request web-app system
Implement the following functional requirements (FRs) of the maintenance request web-app system. All functionalities must be web-based. To show your web application work, take screenshots for each functionality. Push your code to your GitHub repo, and submit the link.

Tenant:
FR1: A tenant must be able to submit a maintenance request. A request consists of the following information: request ID, apartment number, the area of the problem (e.g., kitchen, bathroom), a brief description of the problem (e.g. bathtub drain gets stuck, AC does not work), the date and time of the request, an optional photo, and the status of the request (e.g., pending, completed). You may assume:
A tenant may not rent more than one apartment at a time.
A tenant can only request the maintenance of their apartment.
A request can only contain one problem. If there is more than one problem, the tenant must submit separate requests.
A request can have at most one photo.
The request ID and the date/time are automatically generated.
The status of a request is initially ‘pending’, and is updated to ‘completed’ by a staff member.

Maintenance staff:
FR2: A staff member must be able to browse all maintenance requests, with a variety of filters: by apartment number, by area (like kitchen), by date range, and by status.
FR3: A staff member must be able to update the status of a selected request, from ‘pending’ to ‘completed’.
You may assume that a staff member cannot edit anything else of a request and cannot delete a request.

Manager:
FR4: A manager must be able to add a new tenant, move a tenant to another apartment, and delete a tenant. A tenant account consists of the following information: tenant ID, name, phone number, email, date of check-in, date of check-out, and an apartment number. You may assume that this system does not handle rent payments. So, there’s no information about payments.
