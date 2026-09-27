## 1. A Working Bedside Device Was Only Half the System

By this point, the Smart IV bedside unit could detect drops, estimate the flow rate, control the tube, and identify some abnormal conditions.

That was useful, but there was still an obvious problem.

If every Smart IV device only showed its information on the small bedside display, the nurse would still need to walk from bed to bed to check each one. That would remove a large part of the reason for building the monitoring system in the first place.

So the next part of the project was the nurse station.

The goal was fairly simple: data from several bedside devices should arrive at one computer, and the nurse should be able to see the important information for the whole ward from one application.

Building that turned out to involve much more than just making a dashboard.

We needed a wireless link from the bedside devices, a receiver connected to the computer, a serial data format, a backend that could continuously read the incoming packets, somewhere to store the data, an alert system, and finally the user interface.

---

## 2. Why We Used a Separate Receiver

We did not want every bedside device to be connected directly to the nurse-station computer with a USB cable, so we needed a wireless link between the bedside units and the desktop system.

For our final setup, the bedside ESP32 units transmitted their data using **ESP-NOW** to another ESP32 acting as the receiver at the nurse station. That receiver was connected to the computer through USB.

The path was roughly:

**Bedside ESP32 → ESP-NOW → receiver ESP32 → USB serial → desktop application**

One question we were asked was why we needed a separate receiver at all. Since the ESP32 already has Wi-Fi, why not send the data directly to the dashboard?

That is actually possible.

An ESP32 does not necessarily need an external Wi-Fi router to communicate using Wi-Fi. It can operate in **SoftAP mode**, where the ESP32 itself creates a Wi-Fi network. A computer or other ESP32 devices can connect to that network and communicate locally.

Another possible design would have been to make one ESP32 act as the access point and connect the other bedside ESP32 units to it as Wi-Fi stations. We could then transfer the data using normal IP-based communication such as TCP or UDP.

So the reason we used ESP-NOW was not because normal Wi-Fi was impossible without a hospital router.

For our use case, ESP-NOW gave us a simpler local communication path. The bedside devices only had small telemetry packets to send, and ESP-NOW allows ESP32 devices to communicate directly without setting up IP addresses, connecting each device to an access point, or maintaining a normal Wi-Fi network.

The separate receiver also gave us a useful boundary between the embedded network and the computer. As far as the desktop application was concerned, all bedside data arrived through one USB serial connection.

There was another practical advantage. The nurse-station computer could keep its normal Wi-Fi connection available for Internet access and AWS while the local bedside communication came through the USB receiver. If we instead made the PC connect directly to an ESP32-created Wi-Fi network, networking becomes a little more awkward because the same computer also needs Internet connectivity for the cloud side.

This does not mean ESP-NOW is the only correct solution. A Wi-Fi SoftAP setup, a dedicated local access point, or other wireless approaches could also be designed to work.

For our prototype, the ESP-NOW and receiver-node approach gave us a clean separation:

- ESP-NOW handled the short-range bedside communication.
- The receiver collected data from the bedside units.
- USB serial connected the receiver to the desktop application.
- The computer's normal network connection remained available for AWS.

It also kept the bedside devices independent of the hospital's Wi-Fi infrastructure, which was something we wanted from the beginning.

The receiver's job itself was fairly simple. It collected incoming bedside packets and forwarded them to the computer. The desktop application did not need to know how each individual bedside device communicated wirelessly; it only needed to read the incoming serial stream.

---

## 3. Serial Communication Became the Bridge

Once the receiver was connected through USB, Windows exposed it as a COM port.

The desktop application had to allow the correct port to be selected and then continuously read whatever the receiver sent through it.

By the final demo, this had become part of the normal startup procedure. We would open the desktop application, select the appropriate COM port, and press **Connect Serial** before starting the bedside unit.

For the data itself, we used structured packets rather than sending a random sequence of numbers.

A bedside update contained values such as:

- Bed ID
- device status
- current flow rate
- remaining volume
- original bag volume
- battery level
- drop factor
- target flow rate
- session information

These values could be represented as JSON before being passed into the desktop side.

Using named fields made the data much easier to understand and debug than something like:

`01,200,197.4,421,82,0`

If something was wrong, we could look at the packet and immediately tell what each value was supposed to represent.

---

## 4. "Nothing Is Showing on the Dashboard"

Serial communication sounds easy until nothing appears on the screen.

This became one of those areas where the problem could be in several completely different places.

The receiver might not be receiving anything.

The receiver might be receiving data but not forwarding it.

The COM port selected in the application might be wrong.

The baud rate might not match the firmware.

Another program such as a serial monitor might already have the port open.

The packet might reach the application but fail while being parsed.

Or the packet might be parsed correctly and still never appear in the UI because of a frontend issue.

That is why debugging the complete path one stage at a time became important.

Instead of immediately blaming the dashboard, we had to check whether the data existed at each point.

First check the bedside transmitter.

Then the receiver.

Then the raw serial output.

Then whether the desktop backend received the line.

Then whether it was parsed.

Then whether the frontend received the update.

That approach saved much more time than randomly changing code at the final UI layer.

---

## 5. The Desktop App Was More Than a Web Page

The desktop application did not actually start with Tauri and Rust.

Our first version was built using **Electron.js**. At that stage, the main goal was simply to get a working desktop dashboard that could display information coming from the Smart IV devices. Electron made that relatively easy because we could use normal web technologies and package the application as a desktop program.

So for the first version, Electron was perfectly fine for proving the idea.

The move to Tauri happened later, and the reason was actually much less planned than the final architecture might suggest.

I wanted to try building something using **Rust**. I had not worked much with Rust before, and I was curious about it. While looking at ways of using Rust for desktop applications, I came across **Tauri**, so I started rebuilding the dashboard using Tauri with a Rust backend and a React/TypeScript frontend.

At first, this was mainly an experiment.

But after building the Tauri version, the difference compared with our Electron version became very noticeable. The packaged application was much smaller, it started faster, and its memory usage was considerably lower. In the versions we built and compared during the project, the application size was roughly on the order of 100 times smaller, while the runtime memory usage was also dramatically lower.

That was when an experiment driven mostly by curiosity turned into a useful engineering decision.

Smart IV was intended for use around normal hospital wards. We cannot assume that every nurse station will have a modern computer with a powerful processor and a large amount of RAM. The available machine could easily be an ordinary office PC that is already being used for other work.

In that kind of environment, running a relatively heavy desktop framework when a much lighter alternative can do the same job does not make much sense.

So although **low resource usage was not the original reason I tried Tauri**, it became one of the strongest reasons for keeping it.

The final desktop stack became:

- **Tauri** as the desktop application framework,
- **Rust** for the backend,
- **React + TypeScript** for the interface,
- and **SQLite** for local data storage.

The React side handled the dashboard, bed cards, alerts, history, and settings. The Rust side handled things that were closer to the operating system and hardware, such as serial communication, packet processing, database operations, alert handling, and eventually MQTT communication with AWS.

---

## 6. Using AI Tools While Building It

This was also one of the parts of the project where AI-assisted development became quite useful.

Since almost all the technologies are new to us, there were plenty of situations where we understood what we wanted the application to do but did not yet know the correct  way of implementing it.

Along with ChatGPT, we also used **OpenAI's Codex inside VS Code** and **Google's Antigravity** while developing the dashboard, mobile app and firmware.

These tools were useful when working directly inside the codebase. We used them to help understand unfamiliar code, generate initial implementations, modify existing parts, trace errors across files, and speed up debugging.

This was especially useful because the application was no longer a small single-file program. A single feature could involve several different parts of the project. For example, receiving a new field from the ESP32 could require changes to the Rust data structure, serial parser, frontend TypeScript types, Zustand store, and finally the React component displaying it.

Having coding assistants available inside the development environment made it easier to navigate those kinds of changes.

So the normal cycle was still:

understand the problem, use the tools to help implement or investigate it, run the application, read the errors, test the actual behaviour, and then fix whatever was still wrong.

---

## 7. One Incoming Packet Had to Go to Several Places

One useful part of the final desktop architecture was that an incoming bedside packet became the starting point for several actions.

When the Rust backend received a packet from serial, it could first parse the data into the expected structure.

From there, the same update could be used for different purposes.

The latest values could be sent to the dashboard.

The telemetry could be written into the local database.

The status could be checked by the alert logic.

And if cloud connectivity was available, the required data could also be forwarded through MQTT.

This meant the serial path became the main local source of live bedside information.

We did not need separate mechanisms for the dashboard, history, and alerts to independently ask the bedside device for data.

They could all work from the same incoming stream.

---

## 8. Building the Actual Ward Dashboard

The main screen had to answer a fairly basic question quickly:

**Is every IV in the ward okay right now?**

That affected how we designed the interface.

Instead of showing one device at a time, the dashboard used bed cards. Each card represented a bed and displayed the important information such as the flow rate, remaining volume, battery level, and current status.

The nurse could get a general view of the ward first and then open more detailed information when needed.

We also added separate areas for history, alerts, and settings.

The settings page became important because some things could not just be hard-coded, especially the serial connection and later the AWS connection.

By the final demonstration, the startup process included checking that the receiver connection and cloud connection were active before moving to the bedside device.

The desktop application had effectively become the middle point between the local hardware system and the remote/cloud side.

---

## 9. Local Storage Was Useful Even Without the Cloud

We also wanted the nurse-station application to keep local records rather than treating every update as temporary.

For this, the desktop application used **SQLite**.

The database stored information related to beds, infusion sessions, telemetry, and alerts.

There were a few reasons this was useful.

First, the history page could show previous measurements instead of only whatever happened to be on the screen at that exact moment.

Second, alert events could be logged.

Third, the local application did not have to depend on the cloud just to retain basic ward information.

That matched the architecture decision we had already made earlier: local monitoring should continue to be useful even if the internet connection is unavailable.

The cloud could add remote access later, but the nurse station itself should not become useless without it.

---

## 10. We Needed to Build the UI Even When the Hardware Was Not Available

One practical problem with hardware-software projects is that the person working on the application does not always have the complete physical system running beside them.

If UI development required a working IV setup, functioning drop sensor, motor, transmitter, receiver, and serial connection every single time, development would have been unnecessarily slow.

So the desktop project also had a simulator.

It could generate fake ward data for multiple beds, including different situations such as normal operation, blockage, empty bag, low battery, and connection loss.

This allowed us to work on things such as:

- how bed cards should update,
- what an abnormal state should look like,
- whether the dashboard layout worked with many beds,
- how alerts appeared,
- and how the frontend state behaved,

without needing the real hardware connected every time.

Later, the same application could be tested against the actual receiver.

This was a very useful separation.

Simulated data was useful for developing the interface.

Real hardware data was still necessary for validating the actual integration.

---

## 11. Frontend Bugs Were Completely Different From Hardware Bugs

By this stage of the project, debugging became interesting because a problem on the screen could have absolutely nothing to do with the ESP32.

One issue we had to deal with was TypeScript types.

For example, if we introduced a new status value somewhere but that value was not included in the shared status type, the build could fail.

That might sound annoying, but the type checking was also useful because it forced the different parts of the frontend to agree on what a valid device status actually was.

Another problem involved frontend state updates.

We used Zustand for application state. At one point, the way a selector created a new array during rendering could cause repeated React updates and effectively lead to an infinite re-render situation.

The fix was not in the serial code, Rust backend, or ESP32.

It was simply a frontend state-management problem.

This is why debugging an integrated project can be confusing. The symptom may be "the dashboard froze", but the actual cause could be several layers away from where you first expect it.

---

## 12. Even the Build Environment Caused Problems

Not every software problem came from our code either.

Rust compilation on Windows introduced its own issues.

One example was an `Access is denied` build error caused by Windows Defender interfering with files inside the Rust build directory.

There were also Tauri configuration problems. Tauri validates its configuration quite strictly, so an invalid field in `tauri.conf.json` could prevent the application from starting correctly.

These are not interesting features of Smart IV, but they are realistic parts of developing the project.

A surprising amount of project time can disappear into problems that have nothing to do with the actual research idea.

Sometimes the IV system is completely fine and you are spending the evening trying to understand why Windows does not want your Rust build to finish.

That is also part of the work.

---

## 13. Alerts Needed Their Own Logic

Displaying the latest status was not enough.

If a bedside unit reported something such as a blockage or an empty bag, the application had to make that condition noticeable.

The desktop backend therefore had an alert-processing layer.

When an incoming packet contained an abnormal status, the system could create an alert and store it locally.

One small issue here was avoiding the same alert being generated continuously.

A bedside device can send updates repeatedly. If every packet containing `BLOCKAGE` created a brand-new alert, the application could quickly fill with duplicate notifications for the same problem.

So the alert logic had to remember active conditions and suppress repeated alerts until the bed returned to a normal state.

After recovery, a later occurrence of the same problem could create a new alert again.

This was a small feature from the user's point of view, but it made the alert system behave much more sensibly.

---

## 14. Keeping the Cloud Out of the Local Data Path

The desktop application eventually also became responsible for forwarding information to AWS.

But we did not want an AWS connection failure to stop local monitoring.

So the serial-reading path and the cloud publishing path were kept separate.

The receiver could continue sending data.

The Rust backend could continue receiving it.

The local database could continue storing it.

The dashboard could continue updating.

If MQTT was disconnected, the cloud side could fail without taking the rest of the nurse-station application down with it.

This continued the same local-first idea that we had already used in the bedside firmware.

The bedside device should not depend on the desktop for its basic control.

The desktop should not depend on AWS for its basic ward monitoring.

Each extra layer should add functionality rather than becoming an unnecessary single point of failure.

---

## 15. What I Would Keep in Mind When Starting a Similar Integration

One thing I would strongly recommend to someone starting out with a project like this is to define the data format early.

If the firmware calls something `flowRate`, the receiver forwards something else, the Rust structure expects another name, and the React interface assumes a different type, integration becomes unnecessarily painful.

The hardware and software teams may each have perfectly working code while the complete system still fails because they disagree about the packet.

I would also make a fake-data or simulation mode early.

Waiting until the complete hardware is finished before developing the application creates an unnecessary dependency between the two sides.

Finally, debug the data path in order.

Do not start at the last screen.

Confirm that the source produced the data, confirm that each intermediate layer received it, and only then move to the next layer.

This became useful not only for the desktop app but later for the entire Smart IV system.

---

## 16. Where the Nurse-Station System Left Us

By this point, we had moved quite far from the original prototype that simply detected IV drops.

The bedside device could monitor and regulate the infusion.

The receiver could collect bedside data.

The desktop application could read it through serial, identify the relevant bed, display the live state, store telemetry locally, and generate alerts.

For the first time, we could stand at one computer and watch the physical IV setup changing in real time.

That was an important integration point for the project.

But we still had another part of the architecture left.

The nurse-station system worked locally. We also wanted selected information to be available remotely, especially when someone was not physically looking at the ward computer.

That meant connecting the desktop application to AWS, deciding how the data should move through the cloud, and getting the mobile application to receive it.

That part introduced certificates, MQTT topics, cloud services, authentication, data-format mismatches, and another round of integration problems.

**Next: Part 6 - Connecting Everything: AWS, Mobile App and the Integration Problems Nobody Sees in the Final Demo**