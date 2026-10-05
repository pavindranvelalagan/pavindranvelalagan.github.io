## 1. Local Monitoring Was Working. Why Add the Cloud?

By this stage, most of the important Smart IV functionality already existed locally.

The bedside device could monitor and regulate the IV. The receiver could collect the data, and the desktop application at the nurse station could show the status of multiple beds.

Strictly speaking, we could have stopped there and still had a reasonable 3YP prototype.

But we wanted to explore what happens when the person who needs the information is not sitting in front of the nurse-station computer.

That led to the cloud and mobile side of the project.

The basic idea was not to move the IV control into the cloud. We had already decided that the critical sensing and control should remain at the bedside.

The cloud was there to extend the monitoring system.

The desktop application already had the live data, so it could forward selected information to AWS. From there, a mobile application could receive live updates and alerts remotely.

That gave us another path through the system:

**Bedside device → receiver → desktop application → AWS → mobile application**

This looked simple enough in an architecture diagram.

Getting every layer to agree with every other layer was the harder part.

---

## 2. Why AWS Was Added After the Local System

One reason we kept the desktop application between the bedside devices and AWS was that the local system should still work when the Internet does not.

The bedside ESP32 did not need to maintain its own AWS connection.

It only had to communicate with the local receiver.

The desktop application could then decide whether to forward the incoming data to the cloud.

This also meant that if the AWS connection failed, the local serial path could continue. The nurse-station dashboard could still receive the bedside packets and show the ward status.

That separation became important throughout the project.

AWS was an additional layer, not part of the actual feedback loop controlling the IV tube.

For the cloud communication itself, we used **MQTT**, with AWS IoT Core acting as the MQTT broker.

MQTT suited the project well because the messages were small and the system mainly needed to publish live telemetry and alerts rather than transfer large amounts of data.

---

## 3. MQTT Was Easy to Understand and Harder to Integrate

Conceptually, MQTT is quite simple.

One application publishes a message to a named topic, and another application subscribes to that topic.

If the desktop application publishes the latest Bed 03 data to the correct topic, a mobile application subscribed to that topic can receive it.

The difficulty is that the word **correct** matters a lot.

The publisher and subscriber have to agree on the topic structure.

They also have to agree on the message format.

The AWS policy has to allow the required action.

The application needs the correct endpoint.

The credentials need to be valid.

The connection needs to use the correct security method.

If any one of those is wrong, the result from the user's side is usually just:

**nothing happened.**

That became a recurring theme during integration.

---

## 4. AWS IoT Was Not Just an Endpoint and a Password

Connecting the desktop application to AWS IoT Core was one of the places where the security side became much more visible.

AWS IoT does not work like connecting to a simple public MQTT broker with a username and password.

For the desktop station, we needed certificates and a private key so that AWS could authenticate the application.

The connection involved the AWS IoT endpoint, the Amazon root certificate, a device certificate, and its private key.

While reviewing the desktop implementation, one of the gaps we found was that the MQTT code itself existed, but the TLS configuration still had empty certificate data.

So having an `mqtt.rs` file did not mean we were actually finished with AWS.

We still had to create the AWS IoT Thing, create the required policy, download the certificates, configure the endpoint, load those files correctly from the Rust application, and then test the connection.

This is a good example of the difference between having a feature in the codebase and having an end-to-end feature that actually works.

---

## 5. A Green "Connected" Indicator Took More Work Than It Looks

In the final demo, connecting the cloud side looks very simple.

Open the desktop application.

Press **Connect to AWS IoT**.

Wait until the status turns green.

That is the result the audience sees.

Behind that button, several things need to be correct at the same time.

The AWS endpoint has to match the correct account and region. The certificate has to be active. The policy has to permit the client to connect and publish. The certificate and key paths have to be correct. The Rust MQTT library has to load them in the format it expects.

When the connection fails, there is no motor or sensor to physically look at.

You are mostly dealing with logs, configuration files, AWS console pages and permission errors.

That made cloud debugging feel quite different from hardware debugging, even though both were part of the same system.

---

## 6. Building the Mobile Application

The mobile application was built using **React Native with Expo** and TypeScript.

We used Zustand again for the application state, similar to the desktop frontend.

The main mobile view showed the beds available to the logged-in user. A bed could then be opened to see more detailed information such as its status, flow information, remaining volume and history.

There was also a separate alert view.

On the code side, we tried to keep the AWS and networking logic away from the UI components as much as possible.

The application therefore had separate services for things such as authentication, MQTT, API requests and notifications.

The live data path and historical-data path were also different.

For live changes, MQTT made sense because the application could receive an update as soon as it was published.

For historical information, normal HTTP requests were more suitable.

This meant the app eventually had to work with more than one type of communication, even though they were all presenting information about the same IV device.

---

## 7. Live Data and Historical Data Were Two Different Problems

One distinction that became clearer while building the mobile side was the difference between **live state** and **stored history**.

If the current flow rate changes, the mobile screen should update quickly.

MQTT is useful for that.

But if someone opens a bed and wants to see what happened earlier, waiting for old MQTT messages does not make sense.

That information has to be stored somewhere and requested when needed.

The fuller AWS architecture therefore included cloud-side storage and API endpoints in addition to MQTT.

The general idea was that telemetry could be routed into a database, while the mobile application could use an HTTP API for historical data.

AWS services such as IoT Core, DynamoDB, Lambda, API Gateway, Cognito and SNS appeared in the broader architecture for different parts of this problem.

This was also where the cloud side started growing much faster than the simple sentence "send the data to AWS" suggests.

---

## 8. Authentication Was Another Layer We Had to Deal With

Once there is a mobile application showing hospital-related information, simply allowing anyone who installs the app to subscribe to every MQTT topic would not be a sensible design.

So authentication became another part of the architecture.

The mobile project used AWS Amplify around the authentication flow, with Cognito providing the AWS-side identity system.

This was also where the mobile MQTT connection became different from the desktop MQTT connection.

The desktop station is a known device, so using a device certificate makes sense there.

A mobile phone belongs to a user.

Giving every copy of the application the same private device certificate would be a bad approach.

The intended mobile flow therefore used the authenticated user's AWS credentials when connecting to IoT Core.

This was one of those parts of the project where "AWS integration" stopped being one feature and became several connected systems that all had to be configured correctly.

---

## 9. The Topic Structure Had to Match Everywhere

One of the more annoying integration problems was MQTT topic alignment.

The desktop application could be publishing perfectly valid messages to AWS and the mobile application could still show nothing.

The reason could simply be that the two applications were using different topic patterns.

For example, if the desktop publishes telemetry using a structure containing the station and bed ID, the mobile subscription has to match that same hierarchy.

AWS IoT Rules also depend on the topic structure.

So changing the topic in one place could mean changing it in several places:

- the desktop MQTT publisher,
- the mobile MQTT subscriber,
- AWS IoT policies,
- and any IoT Rules that process those messages.

This is the kind of integration problem that is easy to create because each individual piece can appear to be working.

The desktop says it successfully published.

AWS is connected.

The mobile app is connected.

But the mobile application still receives nothing because they are effectively talking in different rooms.

Eventually we started treating the MQTT topic structure as part of the interface between the applications, not just an arbitrary string inside the code.

---

## 10. The JSON Structure Had the Same Problem

Topics were not the only thing that had to stay consistent.

The contents of the message had to match too.

By this point, one bedside update could pass through several representations:

the ESP32 firmware,

the receiver,

the Rust desktop model,

the TypeScript desktop types,

MQTT JSON,

and the React Native mobile types.

A field could be called one thing on the hardware side and something slightly different on the mobile side.

A status value could exist in one TypeScript type but not another.

A numeric value could arrive as a different type than the code expected.

These are small mistakes individually, but in a system with many layers they can be difficult to find.

This was another place where defining a common data format earlier would have saved us time.

Once the full system existed, changing something as simple as a field name could require checking several different codebases.

---

## 11. Debugging From the Phone Backwards

The mobile application added another useful debugging lesson.

If the numbers on the phone were not changing, the problem was not necessarily inside the mobile UI.

The first thing to check was whether the MQTT callback was receiving anything.

If no message arrived there, the next questions were whether the mobile app had subscribed to the correct topic and whether it was actually authenticated.

Then we could check AWS IoT Core using its MQTT test client.

If AWS was receiving the desktop messages correctly, the problem was probably somewhere between AWS and the mobile subscription.

If AWS was not receiving anything, we moved backwards again towards the desktop publisher.

That debugging path became something like:

**Phone UI → mobile MQTT service → AWS IoT Core → desktop MQTT publisher → serial input → receiver → bedside device**

This is the same principle we had learned earlier with the desktop application, just across a much longer chain.

When a system has many layers, start where the symptom appears and verify the boundary between each layer instead of randomly editing code everywhere.

---

## 12. Notifications Were Different From Having the App Open

Another thing we had to think about was the difference between live monitoring while the application is open and actually notifying someone when they are not looking at the app.

An MQTT update can change the React Native interface while the application is active.

That is not the same thing as a proper phone notification.

The broader cloud design therefore also included an alert-processing path where abnormal conditions could trigger a cloud function and then a push-notification service.

Our mobile code also had a separate notification service for registering and handling phone notifications.

This is another detail that is hidden by the phrase "send an alert to the phone".

On the final architecture diagram it can be one arrow.

In practice, there are several services and permissions behind that arrow.

---

## 13. The Cloud Architecture Grew Faster Than Expected

AWS was probably one of the clearest examples of scope expanding once implementation started.

At first, the requirement sounded simple:

**make the IV information available on a phone.**

Then the questions started.

How does the phone receive live data?

How does it authenticate?

Where does history come from?

Where are alerts stored?

How do we send a notification when the app is closed?

How do we stop one user from subscribing to data they should not access?

What happens when credentials expire?

What happens if the Internet connection disappears?

One requirement slowly turned into IoT Core, MQTT, certificates, authentication, APIs, storage and notification services.

This was useful experience, but it also reminded us why the local bedside and desktop system had to remain the core of the project.

If we had made all of this a requirement before the first drop sensor even worked, we probably would have created another AIVM-sized scope problem for ourselves.

---

## 14. Not Every Box in an Architecture Diagram Has the Same Maturity

This is also a point I think is important when writing about a university prototype.

A final architecture diagram can make every component look equally complete.

That is not always the reality.

Some parts of Smart IV were exercised continuously because they were required for every hardware test. The bedside sensing, motor control, receiver and desktop path belonged to that category.

The cloud and mobile side had more configuration, service integration and infrastructure around it, and some parts of the broader architecture existed as the intended complete flow and setup work rather than being as mature as the bedside control path.

I think it is better to say that clearly than to make a prototype sound like a finished hospital deployment.

The important thing for us was demonstrating how the layers could connect while keeping the safety-critical behaviour local.

A real deployment would require much more work around security, clinical validation, reliability, user management, infrastructure and long-term operation.

---

## 15. End-to-End Testing Was the Only Test That Really Mattered at This Stage

By the time all of these layers existed, testing one component by itself was no longer enough.

We needed to send something from the beginning of the system and follow it all the way through.

For the cloud side, that meant checking whether the desktop could publish a packet and whether it appeared in AWS IoT Core.

Then we could check whether the relevant AWS rule processed it.

Then whether stored data appeared where expected.

Then whether the mobile application received the live update.

For an abnormal status, we could follow the alert path as well.

This type of testing was slower, but it exposed the problems that unit-level testing could not.

A mobile screen can work perfectly with fake data.

An MQTT publisher can work perfectly with a test broker.

An AWS rule can work perfectly when manually triggered.

The project only works when the real packet from the actual Smart IV device survives all of those boundaries.

---

## 16. What I Would Do Earlier on a Similar Project

If I were starting another multi-platform IoT project, I would define three things much earlier.

First, I would define one common telemetry schema and treat it as a contract between every part of the system.

Second, I would decide the MQTT topic structure early and avoid changing it casually once multiple applications depend on it.

Third, I would create a simple end-to-end test path as soon as possible.

It does not need every feature.

One ESP32 value reaching one desktop application, one cloud topic and one mobile screen is enough.

Once that path works, more fields and features can be added gradually.

Trying to build the hardware, desktop application, cloud backend and mobile application separately and only connecting them near the end creates a much more difficult integration problem.

We still ended up doing some of that ourselves.

That is why this part of the project involved so much debugging that was almost invisible in the final demonstration.

---

## 17. Where This Left the Project

At this stage, all of the major pieces of Smart IV existed.

The bedside hardware could sense and regulate the IV.

The firmware could monitor the flow and detect abnormal states.

The local receiver could collect the bedside packets.

The desktop application could monitor the ward.

The cloud layer could extend the data beyond the local station.

And the mobile application gave us another way to view that information remotely.

Getting those parts to work individually was one problem.

Getting them to behave like one system was another.

After that, the remaining work was less about adding another major layer and more about getting the entire project ready to demonstrate reliably: repeated testing, cleaning up the hardware, improving the enclosure and interfaces, preparing documentation, handling competition feedback and making sure the demo would not fall apart when someone was actually watching it.

That is what I will cover in the final part of this series.

**Next: Part 7 - Getting Smart IV Ready for the Final Demo: Testing, Competitions and What We Learned**