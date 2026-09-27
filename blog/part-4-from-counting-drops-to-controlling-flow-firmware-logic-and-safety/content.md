## 1. Getting Past the "Sensor Works" Stage

By the end of the hardware stage, we could detect IV drops and move the stepper motor.

That was enough to prove that the main physical parts were possible, but it was still far from an automatic flow-control system.

The next problem was firmware.

We had to take individual drop detections, calculate a useful flow rate from them, keep track of how much fluid had passed, decide whether the flow was too high or too low, move the motor accordingly, and also decide what to do when something abnormal happened.

This was also the point where mistakes in software started to matter much more.

If a dashboard displays a wrong number, that is a software bug.

If software makes a wrong decision and then moves a motor that is physically controlling an IV tube, that is a different level of problem.

Our project was still a research prototype and not a medical device intended for actual clinical use, but even at prototype level this changed how we had to think about the firmware.

---

## 2. From Individual Drops to Flow Rate

The first firmware task was converting the IR sensor output into something meaningful.

Every time a drop crossed the IR beam, the ESP32 registered a drop event.

From there, we could calculate the number of drops per minute. The IV set also has a known **drop factor**, which tells us how many drops correspond to one millilitre of fluid.

That gave us enough information to estimate the flow rate in millilitres per hour.

The basic relationship is:

**Flow rate (mL/hr) = Drops per minute × 60 / Drop factor**

So if the drop factor is known and the device can count drops over time, the flow can be estimated continuously.

The same information was useful for tracking the remaining volume.

The nurse enters the initial IV bag volume when starting the session. As drops are counted, the firmware estimates how much fluid has already passed through the chamber and subtracts that from the starting volume.

This gave us three values that became important throughout the rest of the system:

- the target flow rate entered by the nurse,
- the measured flow rate from the sensor,
- and the estimated amount of fluid remaining.

These values later became part of the data sent to the desktop application as well.

---

## 3. Why We Could Not Just Set a Motor Position

One simple way of controlling the IV would have been to find a motor position for each flow rate and save those positions.

For example, perhaps position A gives 100 mL/hr and position B gives 200 mL/hr.

The problem is that the physical system does not behave that neatly.

The flow is affected by the tube, the clamp position, gravity, the IV setup, and other physical conditions. The same motor movement does not guarantee exactly the same flow every time.

So instead of trusting the motor position, we needed to trust the **measured result**.

That pushed us towards closed-loop control.

The system measures the current flow, compares it with the required flow, changes the tube compression, measures the result again, and keeps correcting the difference.

That feedback loop was much more suitable for what we were trying to do.

---

## 4. Introducing PID Control

This was where we started working with **PID control**.

PID stands for Proportional, Integral, and Derivative control.

We did not begin the project already knowing PID well enough to immediately write the controller. This was another part of the Just-In-Time learning process. Once it became clear that we needed feedback control, we started learning the basic idea and how it could apply to our system.

The controller basically looks at the difference between the target flow rate and the measured flow rate.

That difference is the error.

If the measured flow is lower than the target, the tube needs to be opened further.

If the measured flow is higher than the target, the tube needs to be restricted further.

The PID controller uses the current error, accumulated error, and the way the error is changing to calculate a control output.

That control output is then translated into stepper-motor movement.

---

## 5. The Feedback Loop Was More Important Than the PID Name

It is easy to focus too much on the term "PID" because it sounds like the important part.

For our project, the more important idea was the feedback loop itself.

The system does not say:

**"I moved the motor by this amount, therefore the flow must now be correct."**

It moves the motor and then continues looking at the drops.

If the measured flow is still different from the target, it makes another correction.

This became especially important later when we were asked a very good question during a competition:

**How do you know the device itself is making the correct decision?**

At first, it sounds like a simple question.

But it goes deeper than asking whether the sensor works or whether the motor works.

Suppose the software calculates that the motor needs to move by a certain amount. What guarantees that this decision was correct?

The useful answer in our system was that the motor command itself is not treated as proof of success.

The sensor measures the result again.

If the commanded movement did not produce the required flow, the error is still present and the controller has to respond again.

That feedback gives us a way of checking the *effect* of the control action instead of simply assuming that the command worked.

---

## 6. But the Sensor Can Also Be Wrong

That competition question also exposed another issue.

A closed-loop controller is only as useful as the feedback it receives.

If the drop sensor produces a wrong measurement, the controller could make a perfectly logical decision based on incorrect information.

This is where the discussion moves from basic control into actual safety engineering.

For our prototype, we tested the optical sensing against known flow conditions and tested the motor regulation separately as well as together.

But that does not mean our prototype suddenly became a clinically validated medical device.

A real product would need much more extensive validation, fault detection, redundant or independent measurements where appropriate, defined safety limits, and testing under many more operating conditions.

This distinction became important for us as the project progressed.

There is a big difference between:

**"Our prototype successfully demonstrated the control concept."**

and

**"This system is safe enough to control a real patient's infusion."**

Our 3YP was the first one.

Keeping that distinction clear also helped us avoid pretending the project was more mature than it really was.

---

## 7. Detecting When Something Is Wrong

Flow regulation was not the only thing the firmware had to do.

We also wanted the bedside device to recognise some abnormal conditions instead of waiting for the nurse to notice them manually.

One important case was when the drops stopped even though the system still expected fluid to remain in the bag.

In our prototype, this was treated as a possible **blockage or occlusion condition**.

This is also the abnormal condition we commonly demonstrated during presentations. We would start a normal IV session and then manually pinch the tube to stop the flow.

The sensor would stop detecting drops while the system still had remaining volume recorded.

The device could then move into a blockage state and indicate the problem locally while also reporting the status to the nurse-station system.

The important part was that the initial detection and response happened at the bedside.

It did not depend on AWS receiving the packet first.

---

## 8. Empty Bag and Blockage Are Not the Same Situation

A zero flow rate by itself does not tell the whole story.

If there are no drops and the bag is expected to be empty, that is different from having no drops while a large amount of fluid should still remain.

That is why keeping track of the estimated remaining volume was useful for more than just displaying a number to the nurse.

It also gave the firmware additional context.

Conceptually, our logic could distinguish between cases such as:

- drops have stopped while fluid should still remain,
- the expected bag volume has reached the end,
- the flow is present but different from the target,
- or communication with another part of the system has been lost.

This state-based approach later made the desktop side easier as well, because the bedside unit could report a clear status rather than sending only raw sensor numbers.

---

## 9. Safety Logic Had to Stay Local

One decision from the architecture stage became especially important here.

The immediate control and safety logic should not depend on the internet.

If the Wi-Fi connection disappears, the bedside ESP32 should still be able to read the sensor and control the motor.

If AWS is unavailable, the IV should not suddenly stop being monitored locally.

If the desktop application closes, the embedded control loop should still continue doing its own work.

So the cloud and desktop systems were designed as additional monitoring layers rather than the place where the basic bedside control decisions were made.

This is why the final system could continue its local control path even if the cloud connection was unavailable.

For a healthcare-related prototype, this made much more sense than putting the internet in the middle of the control loop.

---

## 10. Separating Control From Communication

The ESP32 also had another job: sending status information to the nurse station.

That created a small architecture problem inside the firmware itself.

We did not want communication work to interfere with the time-sensitive sensing and control side.

In the final design, we separated these responsibilities across the ESP32's processing resources.

The sensing, flow-control logic, and safety-related work were kept separate from the communication path used to send telemetry towards the nurse station.

The exact implementation evolved while the project was being built, but the general idea was simple: losing or delaying a wireless packet should not interrupt the bedside control loop.

This same idea appeared again later in the desktop application, where cloud communication was also kept separate from the local serial-data path.

---

## 11. The Device Needed Proper States

As the firmware grew, treating everything as a collection of independent `if` statements became harder to reason about.

The device had several different stages even during normal use.

Before starting, the nurse enters the Bed ID, target flow rate, and bag volume.

The values are then verified.

After pressing Start, the device enters the active infusion state.

During operation, it may remain stable, detect an abnormal condition, receive a change, or be stopped.

Thinking in terms of states made the behaviour easier to understand than thinking only in terms of sensor values.

It also helped us decide what the display should show and what information should be sent to the desktop application.

By the final demo, the workflow was quite clear from the user's side even though a lot more was happening inside the firmware.

---

## 12. Testing the Logic Was Different From Testing the Code

One lesson from this stage was that firmware for a physical system cannot be tested only by checking whether it compiles.

The code may compile perfectly while the physical behaviour is still wrong.

We had to test using the actual IV setup.

For example, we could compare the sensor output with a known drip behaviour, change the target flow, observe whether the motor responded in the expected direction, and watch whether the measured rate moved closer to the target.

For the blockage case, we physically interrupted the tube and checked how the system responded.

This type of testing was much more useful than simply printing values to the serial monitor and deciding that the logic looked correct.

The firmware, sensor, motor, clamp, and IV setup all had to be tested together.

That is where many problems became visible.

---

## 13. What I Would Pay More Attention to When Starting Out

If I were starting a similar embedded control project again, I would separate three questions very clearly:

**What did the controller command?**

**What did the hardware actually do?**

**What did the sensor measure afterwards?**

Those are not always the same thing.

It is easy to write firmware that assumes a successful motor command means a successful physical action.

In reality, the motor can move while the mechanism slips, the tube can behave differently, or the sensor can give an unexpected reading.

For a feedback-control project, measuring the result is just as important as generating the command.

I would also test abnormal states much earlier.

Normal operation is usually the easiest demo to make work.

The more interesting questions start when the sensor stops seeing drops, communication disappears, the power changes, or some part of the physical system does not behave as expected.

---

## 14. Where the Firmware Stage Left Us

By this stage, the bedside device was doing much more than simply counting drops.

It could take the target values entered by the user, estimate the current flow, keep track of remaining volume, use feedback to regulate the tube, detect important abnormal conditions, update the local display, and send its status outward.

That meant the next major problem was no longer inside the bedside unit.

We now had useful data coming from the device.

The question became: **how do we get that data to one place where a nurse can monitor several beds without walking to each device?**

That led us into the receiver node, serial communication, and the Smart IV desktop application.

And just like the hardware and firmware stages, that side came with its own set of bugs.

**Next: Part 5 - Getting the Device Data onto a Computer: Building the Nurse-Station System**