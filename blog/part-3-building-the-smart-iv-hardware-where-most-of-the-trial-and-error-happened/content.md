## 1. Moving From Diagrams to Actual Hardware

By this point, we had a reasonable idea of what Smart IV was supposed to do.

The bedside unit had to detect IV drops, estimate the flow rate, adjust the tube when necessary, show the important values locally, and send the status to the nurse station.

On paper, that sounds straightforward.

The hardware stage was where a lot of the assumptions started getting tested properly.

A sensor that works when you hold an object in front of it is not automatically a good IV drop sensor. A stepper motor rotating correctly does not mean it can control fluid flow through a soft tube properly. And a circuit that works when each module is powered separately does not necessarily behave the same way after everything is connected together.

A large part of this stage was simply building one small section, testing it, changing it, and testing it again.

---

## 2. Starting With the Drop Sensor

The first important problem was detecting the drops inside the IV drip chamber.

Our control system depended on this measurement. If the drop count was wrong, the calculated flow rate would also be wrong, and any automatic control based on that value would be wrong as well.

We used low-cost IR sensor modules for this.

The basic idea was to pass an infrared beam through the drip chamber. When a drop passed through the beam, the received light level would change, allowing the ESP32 to detect the event.

The problem was that the common IR modules we were using were not really designed specifically for this kind of setup. The emitter and receiver were originally placed together on the same module.

For an IV drip chamber, what we really wanted was the emitter on one side and the receiver on the opposite side.

So we physically modified two sensor modules.

One module was turned into the **emitter side** by keeping the IR emitter and removing the photodetector. The second one became the **receiver side** by keeping the photodetector and removing its emitter.

That gave us a proper beam passing through the drip chamber instead of trying to use the module in its original reflective arrangement.

It was not a polished sensor solution, but for the prototype it gave us a workable way to test the idea.

---

## 3. Sensor Placement Mattered More Than Expected

Once the emitter and receiver were separated, the next issue was physical alignment.

The drop had to actually cross the IR path.

If the emitter and receiver were slightly misplaced, or if the drip chamber was sitting differently, the signal could change enough to affect detection.

External light was another practical factor. Bright light or direct sunlight reaching the receiver could interfere with the optical setup.

This meant the sensor holder itself was part of the sensing system.

It was not enough to write a good drop-detection function in the firmware. The sensor had to be positioned consistently around the drip chamber as well.

By the final setup, the installation procedure specifically required the drop path to cross the emitter-to-receiver line and avoided exposing the sensor directly to strong or flashing light.

This was a good example of something that looks like a software problem at first but is partly a mechanical problem.

If the physical measurement is unstable, changing the code forever is not going to completely fix it.

---

## 4. Turning Drop Counts Into Something Useful

Once we could detect individual drops, the next step was turning those pulses into a flow-rate measurement.

The IV set has a known drop factor, so the number of detected drops over time can be converted into an approximate flow rate.

The same drop count can also be used to estimate how much fluid has already left the bag.

If the nurse enters the original bag volume, the system can keep subtracting the delivered volume and estimate how much remains.

That gave the bedside device the two main values we needed later:

- the current flow rate,
- and the estimated volume remaining.

The firmware side of this becomes more interesting once the feedback controller is added, so I will go deeper into that in the next post.

At the hardware stage, the important thing was getting a sensor signal that was consistent enough to build the rest of the system around.

---

## 5. The Harder Part: Physically Controlling the Tube

Measuring the flow was only half of the bedside system.

The next challenge was actually changing it.

A normal gravity IV set already controls flow by compressing the flexible IV tube using a roller clamp. Our idea was to automate a similar action.

For that, we used a **NEMA17 stepper motor** driven by a **TMC2208** motor driver.

The stepper motor was useful because we could move it in controlled steps and know how much movement we had commanded.

But that does not mean the actual flow through the tube changes in an equally neat way.

The thing being controlled is not a rigid mechanical part. It is a soft plastic tube.

A small motor movement may make very little difference while the tube is still mostly open. Closer to the restricted position, another small movement can cause a much larger change in the flow.

The tube can also deform differently depending on how it is positioned inside the mechanism.

So one of the things we learned here was that **motor position and IV flow are not the same thing**.

The motor can move perfectly while the actual fluid behaviour is still different from what you expected.

That is why the drop sensor had to remain part of the loop. We could not simply decide that a certain motor position must always correspond to a certain flow rate.

---

## 6. The Mechanical Mechanism Was Part of the Control System

This was also where the mechanical design became more important than we initially expected.

The tube had to sit in a repeatable position.

The moving part had to compress it without damaging it.

The motor needed enough travel to go from open to sufficiently restricted, but it also should not continuously drive into a hard mechanical stop.

Even small changes in the geometry could affect how much pressure was applied to the tube.

By the final version, the installation process included checking that the selected tube section could move through the required clamp range without the motor reaching a hard limit.

This is one thing I would tell anyone doing a project involving motors: do not treat the mechanical section as something you can finish after the electronics.

The motor, mechanism, sensor, and control algorithm all affect each other.

For us, improving the hardware meant repeatedly moving between those areas rather than finishing them one by one.

![screenshot_2026-09-27_170434.png](blog/part-3-building-the-smart-iv-hardware-where-most-of-the-trial-and-error-happened/images/pinching-mechanism.png)
[The 3d model of pinching mechanism]

---

## 7. Getting the TMC2208 and Stepper Setup Stable

The motor also added another set of electrical details.

The ESP32 itself cannot directly drive a NEMA17 stepper motor, so the TMC2208 sits between them.

The ESP32 provides the control signals such as **STEP**, **DIR**, and **ENABLE**, while the motor receives its power through the driver.

By the final wiring, the TMC2208 logic side ran from the ESP32's 3.3 V supply while the motor side used the raw battery voltage.

We also had a 100 µF capacitor placed close to the driver's motor supply pins.

There was also a pull-up arrangement on the TMC2208's PDN pin.

These are small details compared with the overall project, but they are exactly the sort of details that take time when building real hardware.

A block diagram can simply contain a box labelled "Motor Driver".

The actual circuit still needs the correct power path, common ground, control pins, motor coil wiring, driver configuration, and protection around the supply.

If any one of those is wrong, the symptom is often just "the motor is not behaving properly".

---

## 8. Power Became Its Own Subsystem

As more modules were added, powering the device also became something we had to think about properly.

The motor and the ESP32 do not have the same power requirements.

In the final circuit, the battery supply was split into two paths.

The TMC2208 motor supply received the battery voltage directly, while an **LM2596 buck converter** reduced the voltage to 5 V for the ESP32.

From the ESP32, the 3.3 V rail powered the logic-side components such as the IR sensors, OLED, and TMC2208 logic supply.

Everything shared a common ground.

This arrangement sounds simple when written in one paragraph, but reaching a clean power layout took more attention once all the modules were connected together.

Motor circuits in particular are not something I would recommend casually wiring into the same supply arrangement as a microcontroller and assuming everything will be fine.

The motor changes current quickly, while the ESP32, sensor, and display need a stable logic supply.

Separating the regulated logic supply from the motor supply made the power arrangement much clearer.

---

## 9. The Local Interface Also Changed During Development

The bedside unit also needed a way for the nurse to enter the required settings.

We eventually used a keypad for values such as the Bed ID, target flow rate, and IV bag volume.

An OLED display was used to show the setup screens and the current device information.

Even here, the circuit changed.

At one stage a level shifter was included around the display connection. In the later circuit, that was removed and the OLED was connected directly to the ESP32's 3.3 V logic.

This is a small example, but it represents a lot of the project quite well.

You start with what you think the circuit needs.

Then you test it.

Sometimes you find that an extra part is unnecessary.

Sometimes you discover that something you left out is actually needed.

The final circuit diagram is only the final state. It does not show all the intermediate wiring decisions that were changed along the way.

---

## 10. The Circuit Became Much More Complicated Than the First Idea

The original hardware idea could be explained very simply:

sensor → ESP32 → motor.

The actual bedside unit eventually had to connect the ESP32, two modified IR modules, the TMC2208, NEMA17 motor, keypad, OLED, power converter, battery system, switches, capacitors, and the communication side.

That is when keeping a proper connection list became important.

When there are only two modules on a breadboard, it is easy to remember where everything goes.

Once GPIO pins are being shared between a keypad, display, sensors, motor driver, and communication functions, trying to remember the circuit from memory becomes a bad idea.

We ended up maintaining a proper connection list with the actual GPIO assignments, voltage rails, motor coil connections, and grounding arrangement.

That sounds like basic documentation, but it saved time when the hardware had to be rebuilt, checked, or modified later.

![4.jpeg](blog/part-3-building-the-smart-iv-hardware-where-most-of-the-trial-and-error-happened/images/4.jpeg)
[This is our early prototype. Built with a wooden box and a lot of messy jumper wires : ) ]

---

## 11. Testing With the Real IV Setup Changed Things

Another thing we learned was to test with the actual physical setup as early as possible.

It is easy to test an IR sensor by moving an object through the beam.

That is not the same as detecting clear liquid drops inside a transparent IV chamber.

It is easy to test a stepper motor by making it rotate forward and backward.

That is not the same as using that motor to repeatedly control fluid through an IV tube.

For testing, we used standard IV sets and saline bags rather than treating the sensor and motor as isolated electronics modules.

This exposed problems much earlier.

The physical position of the drip chamber mattered.

The tube position mattered.

The clamp mechanism mattered.

The bag height and gravity mattered.

The sensor alignment mattered.

The flow itself was not perfectly constant.

Once the entire physical path was involved, the system behaved much more like the real problem we were trying to solve.

---

## 12. We Did Not Jump Straight to a Clean Final Device

The final version of Smart IV had a much cleaner enclosure and internal arrangement, but the hardware development obviously did not start there.

During development, being able to access connections and replace components was more important than making the device look finished.

Only after the main circuit, sensing, motor control, and power arrangement were stable enough did it make sense to spend more effort on the enclosure, PCB layout, mounting, and overall presentation.

This is another thing I would recommend to juniors.

Do not spend too much time making the first prototype look good.

A neat enclosure does not help much if you later realise the sensor needs to move 20 mm, the motor orientation needs to change, or another wire needs to be added.

Early hardware should be easy to modify.

Make it cleaner when you actually know what you are keeping.

---

## 13. What This Stage Taught Us

The biggest lesson from the hardware stage was that a component working by itself does not mean the complete hardware system works.

The IR module worked as an IR module, but we still had to change the physical arrangement for IV drop sensing.

The stepper motor could rotate accurately, but we still needed a mechanism that converted that movement into useful tube compression.

The power supply could produce voltage, but the motor and logic sections still needed to be arranged properly.

The OLED could display text, but the interface still had to make sense for the person using the device.

The actual project was in the connections between those things.

This stage was probably where the project felt the least "clean". There were many small changes, rewiring, repeated tests, and situations where we were not initially sure whether the problem was hardware, firmware, or the mechanical setup.

But by the end of it, we had the basic physical system we needed: detect the drops, measure the flow, move the clamp, and operate the bedside unit.

The next problem was making the device decide **how much** to move the motor and what to do when the flow behaved abnormally.

That moved us from hardware into firmware, closed-loop control, and safety logic.

**Next: Part 4 - From Counting Drops to Controlling Flow: Firmware, Logic and Safety**