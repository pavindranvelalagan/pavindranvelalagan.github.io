## 1. Starting With the Problem, Not the Final Architecture

In the previous post, I wrote about how we dropped our original AIVM Rover idea and eventually moved towards Smart IV.

Choosing Smart IV gave us a direction, but it did not immediately tell us what to build.

At that point, the idea was still quite broad. We knew we wanted to improve the way normal gravity-based IV drips were monitored, but there is a big difference between saying "let's make a smart IV system" and deciding what the actual device should measure, what it should control, what the nurse should see, and what should happen when something goes wrong.

One mistake that would have been easy to make was to immediately start choosing sensors, microcontrollers, cloud services, and programming frameworks.

Instead, the more useful question was: **what should the system actually do?**

That question ended up shaping most of the architecture later.

---

## 2. Understanding the Basic Hospital Scenario

We were mainly thinking about a normal hospital ward rather than an ICU setup with expensive infusion equipment for every bed.

In a standard gravity IV setup, the fluid flows because of gravity, and the flow is adjusted manually using the roller clamp on the IV tube. The drip chamber gives a visual indication of the flow, but someone still needs to check it.

For our project, we imagined a nurse looking after several patients in the same ward. The nurse should not have to stand beside every IV continuously just to know whether it is still flowing normally.

That gave us a simple working scenario.

A nurse should be able to go to a bedside, enter the required information for that IV session, start the device, and then continue with other work while the system keeps monitoring the drip.

The bedside unit would need enough information to identify the patient location and understand the intended infusion. In our prototype, this eventually meant values such as the **Bed ID**, the required **flow rate**, and the **IV bag volume**.

Once the infusion started, the system should keep track of what was happening and make that information available to the nurse.

This sounds obvious when written down, but having a basic user flow helped us decide which features were actually necessary.

---

## 3. What Did We Actually Need to Measure?

The next question was what information we could realistically get from a normal IV setup without completely replacing it.

The most obvious thing available to us was the drip chamber.

If we could detect each drop passing through the chamber, we could calculate the drip rate. With the known drop factor of the IV set, that could also be converted into an approximate flow rate.

Counting drops also gave us another useful value. If we knew the starting bag volume, we could estimate how much fluid had already passed and how much remained.

So the basic sensing side started to become clearer:

- detect individual drops,
- calculate the current flow rate,
- keep track of the amount delivered,
- estimate the remaining volume,
- and detect unusual changes in the flow.

This was a much better starting point than trying to design every feature at once.

We also had to be careful about what we claimed the device could actually know.

A sensor looking at the drip chamber can tell us about the behaviour of the drip. It cannot magically tell us everything happening inside the patient's body.

So the conditions we could reliably reason about had to come from the measurements available to the device. For example, if the system still thinks there is fluid remaining but the drops suddenly stop, that is useful information and can indicate a blockage or another interruption in the flow.

That became one of the important abnormal conditions we focused on in the prototype.

---

## 4. Monitoring Was Useful, but We Also Wanted Control

If the project only counted drops and displayed the number, it would still be useful as a monitoring system.

But we wanted to go one step further.

The normal IV setup already has a way of controlling flow: squeezing or releasing the tube.

The obvious question was whether we could automate that movement.

If the nurse enters a target flow rate and the device continuously measures the actual flow rate, then there is a feedback loop available.

If the measured flow is too low, the system can open the tube slightly.

If it is too high, it can restrict the tube.

That was the basic idea behind making Smart IV a **closed-loop system** rather than only a monitoring device.

We were not starting with a fully tuned PID controller and a finished motor mechanism. Those details came later and created their own set of problems.

At the planning stage, the important decision was simpler: the system needed both a **sensor** and an **actuator**.

The sensor tells us what the IV is doing.

The actuator gives the system some ability to correct it.

That one decision affected most of the hardware design that came afterwards.

---

## 5. Keeping the Existing IV Setup Was Important

Another early decision was that we did not want our prototype to require a completely new IV system.

The idea was to make something that could work around a normal gravity IV setup.

This meant our device had to be more of a retrofit system. The IV bag, drip chamber, and tube would still be the normal ones. Our hardware would observe the drip chamber and mechanically interact with the tube.

That decision introduced some difficulties later, especially on the mechanical side, because controlling the flow by physically compressing a flexible IV tube is not as clean as controlling a purpose-built pump.

But it also kept the main idea of the project clear.

We were not trying to build an entire medical infusion pump from scratch.

We were trying to add monitoring and automatic control to an existing gravity-drip setup.

That difference was important for keeping the project somewhat manageable.

---

## 6. One Bedside Device Was Not Enough for the Full Use Case

Once we thought about the nurse's actual workflow, another problem became obvious.

Even if the bedside unit can show the current flow rate on its own display, that still means the nurse has to physically walk to the bed to check it.

For a single prototype, that is fine.

For the actual idea we were trying to demonstrate, it was not enough.

We wanted the nurse to be able to look at one place and see the status of multiple IV units in the ward.

That was where the idea of a **nurse-station application** started making sense.

The bedside device would handle the actual sensing and control. The nurse-station system would collect information from the bedside units and present it in a more useful way.

The desktop side did not need to control every small motor movement. That would create an unnecessary dependency between the patient's IV and a PC.

Instead, the bedside unit should be able to operate by itself, while the desktop application receives information such as the current flow rate, volume remaining, battery level, and device status.

This separation became more important as the project developed.

---

## 7. Critical Things Should Not Depend on the Internet

Once cloud connectivity entered the discussion, we had to decide what should happen if the internet disappeared.

For a student IoT project, it is tempting to send everything to the cloud and make the cloud the centre of the system.

That would have made the architecture look very "IoT", but it did not make much sense for this particular application.

If an IV line becomes blocked, the bedside device should not have to send a packet to AWS, wait for something in the cloud to process it, and then receive a response before taking action.

The important decisions need to happen beside the patient.

This eventually became one of the main principles of the system: **cloud services are useful for monitoring and notifications, but they should not be required for the basic infusion control to continue.**

The same idea applies to the desktop application.

If the nurse-station PC disconnects, that should not suddenly stop the bedside unit from doing its basic job.

This was one of the better architecture decisions we made because it gave us a clear boundary between the different parts of the system.

The bedside unit was responsible for the immediate sensing, control, and basic safety response.

The desktop system was responsible for centralized ward monitoring and local records.

The cloud and mobile side were for remote access and additional notification.

---

## 8. The Architecture Started to Form Naturally

Once those responsibilities were separated, the overall structure became much easier to think about.

We gradually ended up with three main levels.

### Bedside

This is where the IV actually exists.

The bedside device needed to:

- detect drops,
- calculate the flow,
- control the tube,
- keep track of the infusion,
- identify abnormal flow conditions,
- show basic information locally,
- and continue operating even if external communication failed.

### Nurse Station

This is where information from several beds could be collected.

The nurse-station side needed to:

- receive data from bedside devices,
- identify which bed the data belonged to,
- show the current status of multiple IVs,
- display alerts clearly,
- and keep some local history.

### Remote / Cloud Side

This part was useful when the nurse or another authorised user was not directly looking at the nurse-station PC.

It could provide remote status, history, and notifications through a mobile application.

The final project became much more detailed than this, but this three-part separation gave us something understandable to work with.

It also meant different parts of the project could be developed somewhat independently.

---

## 9. Choosing Communication Was Its Own Problem

Once we decided that several bedside devices should report to one nurse station, we needed a communication method.

There were several possibilities, and this was another area where we had to learn things as we went.

We did not want each bedside device to depend completely on the hospital Wi-Fi network just to communicate with a PC in the same ward.

The final system used a separate ESP32 as a receiver node. Bedside devices could send their data wirelessly to that receiver, and the receiver connected to the nurse-station PC through USB serial.

That gave us a useful boundary.

The bedside device only needed to worry about sending its telemetry to the local receiver.

The desktop application only needed to read the serial data coming through the connected COM port.

Later, the desktop application could forward the required information to AWS.

This was easier to reason about than making every bedside device independently handle the full cloud connection.

Of course, reaching the final communication setup was not just a matter of drawing arrows on a diagram. Wireless communication, packet formats, serial communication, COM ports, and keeping the data structures consistent created plenty of problems later.

Those are better covered in the hardware, desktop, and integration posts.

---

## 10. Technology Choices Came After the Functional Blocks

One thing I would do the same way again is to avoid making the project about a specific technology too early.

For example, the requirement was not:

**"We must use AWS."**

The requirement was:

**"We want the IV status to be available remotely and we want alerts to reach someone who is not looking at the ward PC."**

AWS became one possible way of implementing that requirement.

Likewise, the requirement was not:

**"We need a Tauri application."**

The requirement was:

**"We need a desktop application at the nurse station that can receive serial data, show multiple beds, keep working locally, and later communicate with the cloud."**

The specific software stack came after that.

The same applies to the ESP32, the motor driver, the IR sensor, and most of the hardware.

We still made technology choices early in some areas and changed things later, but separating the **problem** from the **tool** helped.

This is something I think is especially useful for undergraduate projects.

It is easy to start a project by saying, "we are going to build an IoT system using ESP32, React, AWS, and MQTT."

That tells you what technologies you want to use.

It does not tell you whether the system makes sense.

---

## 11. We Also Had to Think About Failure Cases Early

Once a device starts controlling something instead of only measuring it, failure cases become much more important.

Even before the final safety logic was implemented, we had to think about questions such as:

- What happens if the bedside unit loses communication with the nurse station?
- What happens if the cloud connection fails?
- What happens during a power failure?
- What happens if the sensor reading itself is wrong?

Some of these questions became more important later when judges and supervisors started asking us how we knew the device itself was making the correct decision.

That is a harder question than simply showing that the motor moves when the code tells it to.

A closed-loop system depends on the quality of its feedback. If the sensor gives a wrong reading, the controller can make a perfectly logical decision based on bad information.

We did not have a perfect answer to every possible failure mode at the beginning.

In fact, some of our safety thinking improved only after we had already built and tested parts of the prototype.

But thinking about failure changed the architecture. It pushed us towards keeping safety behaviour local, adding clear device states and alerts, and later thinking about redundancy and validation rather than simply trusting one software decision.

---

## 12. The Architecture Diagram Was Not the Project

By the time the project was mature, we could draw a fairly clean architecture showing the bedside device, receiver, desktop application, AWS, and mobile application.

That diagram is useful for explaining the system now.

It would be misleading, though, to pretend that we had that exact diagram at the start and simply implemented each box one after another.

The real process was more iterative.

We would define a requirement, choose an approach, build part of it, discover another constraint, and then update the design.

Sometimes a feature that seemed important early became less important.

Sometimes something that looked like a small addition, such as centralized monitoring, created a whole new software and communication problem.

Sometimes the hardware itself forced us to change what we had planned.

The architecture became cleaner as our understanding of the project improved.

That is probably normal for this kind of undergraduate project.

---

## 13. A Useful Lesson for Planning a 3YP

One thing I would recommend to juniors is to write down what each part of the system is **responsible for** before worrying too much about the exact technology.

For our project, a simple version would have been:

**Bedside device:** measure and control the IV.

**Nurse station:** monitor several bedside devices.

**Cloud/mobile:** provide remote access and additional alerts.

That is much easier to work with than starting with twenty boxes containing technology names.

It also helps when something changes.

If AWS is replaced with another cloud service, the main responsibility of that layer has not changed.

If one type of sensor is replaced with another, the bedside unit still needs to measure the drip.

The technology can change while the requirement remains the same.

For a project where we were learning many things just when we needed them, that separation helped us avoid getting completely lost in the tools.

---

## 14. What Came Next

At this point, Smart IV was no longer just "a device that counts IV drops."

We had a clearer picture of what the bedside unit should do, what information the nurse needed, why a local monitoring station made sense, and why the critical control path should not depend on the cloud.

The next step was much more physical.

We had to turn these ideas into an actual device.

That meant selecting sensors, getting reliable drop detection, choosing a motor and driver, figuring out how to physically control a soft IV tube, dealing with power, wiring everything together, and discovering that some things which looked simple on paper were not simple at all once hardware was involved.

That will be the next part.

**Next: Part 3 - Building the Smart IV Hardware: Where Most of the Trial and Error Happened**