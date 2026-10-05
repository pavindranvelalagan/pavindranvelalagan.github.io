## 1. Reaching the "It Works" Stage Was Not the End

By the time the main development work was done, Smart IV had become much larger than the first prototype we started with.

We had the bedside hardware, drop sensing, motorised flow control, firmware, wireless communication, a receiver node, the desktop application, AWS integration and the mobile application.

At that stage, it was tempting to think that the project was basically finished.

It was not.

Having every individual part work at least once is very different from having the complete system work reliably enough to demonstrate in front of someone.

The last part of the project involved a lot of testing, fixing small problems, cleaning up the hardware and software, preparing documentation, rehearsing the demonstration and making sure we actually understood the decisions we had made well enough to explain them.

In some ways, that final stage taught us as much as the implementation itself.

---

## 2. Testing the Whole Chain

Earlier in the project, most testing was done one subsystem at a time.

We would test whether the IR sensor could detect drops, whether the motor could move properly, whether the receiver could receive packets, and whether the desktop application could read serial data.

That is necessary while developing individual components, but eventually the complete path had to be tested.

A real Smart IV session involved several things happening together.

The bedside device had to read the IV drops correctly. The firmware had to calculate the flow and control the stepper motor. The ESP32 had to send its telemetry. The receiver had to forward it to the computer. The desktop application had to parse and display it. The alert state had to appear correctly. If AWS was connected, the cloud side also had to receive the required data.

A small mistake at any one of those boundaries could make the final result look like the whole system had failed.

This made end-to-end testing much more important near the end.

---

## 3. We Needed a Repeatable Startup Procedure

One thing we gradually learned was that a demonstration should not depend on remembering a random sequence of setup steps.

By the final version, we had a much clearer startup procedure.

At the nurse station, the desktop application had to be opened first. The ESP32 receiver had to be connected to the computer, the correct COM port selected, and the serial connection started.

If we wanted the cloud side for the demonstration, AWS IoT also had to be connected.

Only after checking that those connections were ready would we move to the bedside unit.

On the bedside device, the nurse enters the **Bed ID**, required **flow rate**, and **IV bag volume**, verifies them, and then starts the session.

That sounds like a small detail, but having a known sequence reduced the number of things that could go wrong before the demonstration even began.

We eventually created a sticker/instruction guide for the device as well, partly because the operating procedure should not exist only in the developers' heads.

---

## 4. The Occlusion Demo Became the Simplest Way to Explain the Project

For presentations, we needed a demonstration that made the purpose of the system understandable without spending ten minutes explaining the internal architecture.

The most useful one was the occlusion scenario.

We would start a normal IV session and let the audience see the live flow information on the bedside unit and desktop dashboard. Then I would manually pinch the IV tube.

That physically stops the flow.

After the device detects that drops have stopped while fluid should still remain, the status changes and the abnormal condition appears on the bedside device and the desktop dashboard.

It was a very simple demonstration, but it brought several parts of the system together at once. The IR sensor had to detect the loss of drops, the firmware had to recognise the abnormal condition, the bedside device had to react locally, the telemetry had to reach the receiver, and the desktop application had to update the correct bed.

If the cloud connection was active, that same event could continue into the remote-monitoring side as well.

Instead of explaining every software module first, we could show the problem happening physically and then explain what the system was doing.

That worked much better.

---

## 5. Demo Reliability Is Different From Development Reliability

During development, restarting something is normal.

If the ESP32 gets into a strange state, reset it. If the desktop application crashes, reopen it. If a COM port changes, select the new one. If AWS does not connect, check the configuration and try again.

During a timed presentation, those small problems become much more stressful.

The system has to work when someone is actually watching.

So near competitions and the final presentation, we spent more time repeatedly running through the same demonstration instead of continuously adding features.

We would power everything on, connect serial, connect AWS, start the bedside unit, enter the session details, check the dashboard, create an occlusion, check the response, reset everything, and do it again.

Repeated testing exposed small problems that were easy to miss when we were only testing one feature at a time.

---

## 6. The Project Also Had to Stop Looking Like a Development Bench

The other change near the end was physical presentation.

For most of the development period, being able to reach the wires and replace components was more important than appearance.

That changes once the system is stable enough.

We worked on the enclosure, PCB and wiring arrangement, mounting, labels and the overall presentation of the bedside unit.

We also prepared things around the product itself: the user manual, operating sticker, website, GitHub repository, diagrams, photos and other documentation.

None of those changes made the PID controller better or made MQTT faster.

But they made the project easier for another person to understand and use.

I underestimated this part earlier.

There is a big difference between showing someone a circuit that works and showing them a complete system where they can understand what each part is for.

---

## 7. Documentation Became More Important Near the End

During development, a lot of information naturally existed in our heads or scattered across code, messages and notes.

By the final stage, that was becoming a problem.

We had to document the hardware connections, software architecture, setup procedure, AWS configuration, application usage and the overall system properly.

We also created a project website where the architecture, hardware, software and project journey could be presented in one place.

The user manual was another part of this.

Writing documentation also exposed things that were not as clear as we thought.

If it is difficult to explain the startup procedure in a few steps, perhaps the procedure itself is too confusing. If two different documents describe the same communication path differently, perhaps the architecture has changed and one of them is outdated.

Documentation was not only something we produced after finishing the project. It also helped us notice inconsistencies in the project itself.

---

## 8. Competitions Became Another Form of Testing

Smart IV went through several competitions during the project.

These were useful for reasons beyond the results themselves.

Every judging panel looked at the project from a slightly different angle. Some focused more on the hardware, some on the IoT architecture, some on the medical use case, and others on reliability, scalability or whether the system could realistically fit into a hospital environment.

That forced us to explain our decisions better.

It also exposed questions that we had not necessarily asked ourselves during normal development.

### SLIoT Challenge 2026

One of the earlier competitions was the **SLIoT Challenge 2026**, where Smart IV became a **finalist**.

The event was held at the **University of Moratuwa**, with the competition associated with the University of Moratuwa, SLT-MOBITEL and IESL.

At this stage, the project was still evolving, so presenting it externally was useful because it forced us to organise the architecture and explain the core idea more clearly.

It also showed us which parts of the system were easy for an outside audience to understand and which parts required better explanation.

### SLASSCOM National Ingenuity Awards 2026

In June 2026, Smart IV was selected as the **Winner of Best Innovative Product - Central Province** at the **SLASSCOM National Ingenuity Awards 2026**.

The event was held at **ITC Ratnadipa, Colombo**.

This was one of the more important milestones for the project because the judging was not only about whether the electronics worked. We also had to explain the usefulness of the idea, the practical problem we were addressing, the technical implementation and why the overall system was innovative.

By this stage, Smart IV had grown enough that we could present it as a complete system rather than only a hardware prototype.

### Innov IoT Challenge 2026

Smart IV was also selected as a **finalist** in the **Innov IoT Challenge 2026**.

The event was held at **SLIIT**.

This competition again gave us another opportunity to demonstrate the complete IoT architecture rather than only the bedside device.

By then, the project included the embedded system, nurse-station dashboard, cloud side and mobile application, so a large part of the challenge was explaining how those pieces worked together without making the presentation too complicated.

### NetX IoT Challenge 2026

In September 2026, we participated in the **NetX IoT Challenge 2026**, organised by the IEEE Student Branch and IEEE Communications Society at the **University of Sri Jayewardenepura**.

The event was held at **USJ**, and Smart IV received **1st Runner Up**.

By this point, we had already presented Smart IV several times, so the project explanation had become much clearer compared with the earlier stages.

We knew which parts needed to be shown rather than described, and the occlusion demonstration had become an important part of how we presented the system.

The questions from the judges were also becoming more technical and more useful.

---

## 9. The Questions We Got Were Sometimes More Valuable Than the Results

Competitions were useful because people who had never worked on the project would immediately question assumptions that had become normal to us.

One question we received was:

**What if the software itself makes the wrong decision?**

It is easy to say that the motor is automatically controlled based on sensor feedback.

But if the sensor measurement is wrong, or the control logic is wrong, then the motor can confidently perform the wrong action.

That question forced us to explain the role of feedback, validation, safety checks and why a prototype like ours would require significantly more redundancy and clinical validation before being considered a real medical device.

Another question was why we used a separate ESP32 receiver instead of simply using normal Wi-Fi from every bedside unit.

That pushed us to explain our communication architecture more carefully and also acknowledge that ESP32 SoftAP or other Wi-Fi-based approaches were technically possible.

These discussions improved how we understood our own system.

Sometimes a judge asking "why did you do it this way?" reveals more than another week of development.

---

## 10. Learning to Say "This Is a Prototype"

Smart IV is related to healthcare, so one thing we had to become careful about was the difference between a university prototype and a deployable medical device.

Our prototype demonstrated that we could detect IV drops, estimate flow, mechanically regulate the tube, detect certain abnormal conditions and connect the system to local and remote monitoring software.

That does not mean we had produced a clinically certified infusion device.

A real product would require much more work.

The sensors would need much stronger validation. Safety mechanisms and redundancy would have to be designed systematically. The mechanical control would require extensive testing across different IV sets and operating conditions.

The electronics, enclosure, software, cybersecurity and complete system would also have to satisfy the relevant medical-device standards and regulatory requirements.

Human testing and clinical validation would be a completely different process from our laboratory demonstrations.

Understanding that distinction actually made it easier to defend the project.

We did not need to pretend that four undergraduates had replaced a commercial medical-device development process.

The purpose of the 3YP was to investigate and demonstrate the engineering idea.

---

## 11. The Final 3YP Presentation

For the final presentation, we tried to demonstrate Smart IV as a hospital scenario rather than as a list of technical features.

The nurse station was prepared first.

The receiver was connected, the serial and cloud status were checked, and then the bedside device was powered on and configured with the Bed ID, flow rate and bag volume.

Once the session started, the audience could see the live information appearing on the desktop dashboard.

After that came the occlusion demonstration.

Pinching the tube was a small action, but it was probably the best summary of the project.

The physical IV behaviour changed, the bedside system detected it, the software state changed, and the nurse-station application showed which bed required attention.

That connected the original problem to the technical system much better than another architecture slide could.

---

## 12. What I Would Do Differently

If I started a project of this scale again, there are several things I would change.

I would define the interfaces between subsystems earlier.

The packet structure between the firmware and desktop app, MQTT topic format, field names and device states should ideally be treated as contracts from the beginning.

I would also perform basic end-to-end integration much earlier.

Even if the first version only sends one sensor value from an ESP32 to a desktop application and then to a phone, having that full path working early reduces the risk of discovering major integration problems near the end.

I would spend less time trying to make early prototypes neat.

During the first few hardware versions, accessibility and the ability to modify things quickly are more useful than a clean enclosure.

I would also be stricter about scope.

Cloud services, mobile applications, authentication, history, notifications and dashboards are all interesting, but none of them matter if the core physical idea does not work.

Finally, I would document changes as they happen instead of trying to reconstruct them later.

The final design rarely matches the first design, and remembering exactly why something changed becomes surprisingly difficult after a few months.

---

## 13. What I Would Recommend to Someone Starting Out

If someone is beginning a similar undergraduate project, I would not worry too much about knowing every technology beforehand.

We definitely did not.

What matters more is being able to learn the next thing when the project requires it.

Start with the smallest version that proves the main idea.

Test real hardware early.

Do not assume that because a component works individually it will work once connected to everything else.

When something fails, isolate the problem instead of changing five layers at the same time.

Ask people outside the project to question your decisions. The questions that are slightly uncomfortable are often the useful ones.

And do not become too attached to the first solution.

We changed the original project idea, parts of the hardware, parts of the architecture, the desktop framework and several software structures when integration exposed problems.

Most of those changes happened because the previous approach taught us something.

---

## 14. Looking Back at the Whole Project

This series started with AIVM Rover, a completely different project involving autonomous indoor mapping.

We dropped that idea because it did not fit our available time, budget and project scope.

Smart IV started from a much smaller question: can we detect the drops in a normal IV setup and do something useful with that information?

From there, the project slowly grew.

Drop detection led to flow measurement.

Flow measurement led to automatic control.

Automatic control led to safety questions.

Multiple devices led to wireless communication and a nurse-station application.

Remote monitoring led to AWS and the mobile app.

And finally, all of those pieces had to be tested, documented and demonstrated as one system.

The finished project looks much more organised than the process that produced it.

That is probably the main reason I wanted to write this series.

A final report normally shows the final architecture.

A presentation normally shows the parts that worked.

A GitHub repository normally shows the code that survived.

What gets lost are the abandoned ideas, wrong assumptions, temporary solutions, debugging sessions, competition questions and small decisions that actually make up most of an engineering project.

Smart IV was our 3rd Year Project, but for me it was also a long exercise in figuring things out as we went.

And that is probably the most accurate way I can describe the whole experience.
