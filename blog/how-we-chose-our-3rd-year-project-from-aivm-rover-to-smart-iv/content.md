## 1. Introduction

Smart IV was not our first idea for the 3rd Year Project.

Before we started working on IV monitoring, our original plan was to build an **Automated Indoor Virtual Mapping Rover**, or **AIVM Rover**. The idea was quite different from what we finally ended up doing. It involved autonomous navigation, SLAM, indoor mapping, image capture, and eventually creating an interactive virtual view of an indoor environment.

It was an idea I had originally come up with, so naturally I was quite interested in taking it forward. We spent some time looking into how it could be implemented, what hardware we would need, and what software would be involved.

But after discussing it with our supervisors and looking at the project more realistically, we started to realise that it was much bigger than it first appeared.

This post is about that early stage of our 3YP: why we dropped AIVM Rover, how we moved towards Smart IV, and what I learned about choosing a project before the real development even starts.

---

## 2. The Original Idea: AIVM Rover

The basic idea behind AIVM Rover was to build a small autonomous rover that could move through an indoor environment, map the area, and capture visual data while travelling through it.

The rover would use SLAM for localisation and mapping. While moving, it would capture images at different points in the environment. Those images could then be connected to the generated map to create something similar to an indoor version of Google Street View.

We also looked at possible extensions such as 3D reconstruction and VR-based viewing.

During the early planning stage, we started reading about ROS2, Gazebo, SLAM, odometry, RGB-D cameras, LiDAR, 360-degree cameras, image registration, and COLMAP. At one point we even considered using two 180-degree cameras instead of buying a dedicated 360-degree camera.

The problem was that almost every part of the idea opened up another large problem.

The rover itself needed to move reliably. Then it needed to know where it was. Then it needed to map the environment without too much drift. After that came path planning, obstacle avoidance, image capture, image positioning, image stitching, and finally some way of presenting everything as a usable virtual tour.

The hardware requirements were also starting to become expensive. A proper setup could need a good depth camera or LiDAR, cameras, motors, batteries, mechanical parts, and other sensors.

We did look into cheaper alternatives. For example, we considered whether odometry and an RGB-D camera could replace a more expensive LiDAR-heavy setup. That helped with the cost, but it did not remove the main issue: the project still had too many difficult parts that all needed to work together.

---

## 3. Why We Dropped It

After discussing the idea with our supervisors, we started looking at it less from the “this would be cool to build” side and more from the “can we actually finish this?” side.

We had to think about the available time, our budget, the hardware we could realistically obtain, and how much time would be spent just getting navigation and SLAM to work properly.

Even if we managed to get the rover navigating, there was still a large amount of work left on the image capture and virtual-mapping side. There was a real possibility that we could spend most of the project period solving only one part of the system.

Eventually, it became clear that the scope did not match the time and resources we had.

So we dropped AIVM Rover.

Since it was originally my idea, I was naturally attached to it. But keeping a project only because you like the concept is not a good enough reason to continue with it.

Looking back, stopping at that stage was probably much better than spending half of the project period trying to force something that was already showing obvious feasibility problems.

---

## 4. Starting Again and Moving Towards Smart IV

After dropping AIVM, we had to go back and look for another project idea.

This time, we were more careful about scope.

We still wanted something with a real problem behind it, and we wanted enough technical depth for a Computer Engineering project. We also preferred something that involved both hardware and software rather than becoming only an application or only an electronics prototype.

Eventually, we moved towards the problem of IV drip monitoring in hospital wards.

The basic issue was much easier to understand. A normal gravity-based IV setup still depends heavily on manual observation. Someone has to make sure the fluid is still flowing, the flow rate is roughly correct, the bag has not emptied, and the line has not become blocked.

That led to the basic Smart IV idea: keep the normal gravity IV setup, but add a device that can monitor what is happening and eventually control the flow as well.

At the beginning, the idea was much simpler than the final system.

We were mainly thinking about questions such as whether we could detect individual drops, calculate the drip rate, estimate how much fluid was left, mechanically adjust the tube, detect when the flow stopped, and somehow inform the nurse when something went wrong.

That was enough to start experimenting.

---

## 5. The Final System Was Not Planned on Day One

The final version of Smart IV became much larger than the original idea.

Eventually, the project included a bedside device, IR-based drop sensing, automatic flow regulation, a motorised tube-control mechanism, wireless communication, a nurse-station desktop application, local storage, cloud connectivity, and a mobile application.

But we definitely did not have all of that figured out from the beginning.

Some parts were planned early. Some were added because we found a need for them while developing the system. Some changed after testing. Others were improved after discussions with our supervisors or after getting questions and feedback during competitions.

I think this is worth saying because final project reports usually make the development process look much cleaner than it really was.

When you look at the final architecture diagram, everything seems organised and intentional. The actual path towards that architecture was much less neat.

---

## 6. Learning Things Only When We Needed Them

Another major part of the project was how we learned the technologies involved.

We did not already know most of the things that eventually became part of Smart IV. We were not starting the project with strong knowledge of PID control, motor control, MQTT, AWS IoT, desktop application development, or mobile integration.

A lot of the work followed a **Just-In-Time learning** approach.

When we needed to detect IV drops properly, we learned more about the sensors. When we started controlling the tube, we had to understand the stepper motor and driver. When the devices needed to communicate, we looked into communication methods. When we needed a nurse-station application, we learned what was required on the desktop side. Later, when remote monitoring became necessary, we started learning MQTT, AWS, and mobile integration.

The process was basically to learn enough about the next problem to start working on it, try something, test it, and then learn more if it did not work.

Sometimes that meant going in the wrong direction for a while. Sometimes an approach looked fine in theory but did not behave the same way with actual hardware.

That happened quite a lot.

For a project that touched several different areas, though, learning things only when they became relevant was much more practical than trying to study every technology in advance.

---

## 7. Where ChatGPT Fit Into the Project

We also used ChatGPT throughout the project, especially when we were entering areas that were completely new to us.

Its most useful role was helping us get familiar with unfamiliar topics quickly.

Before going through long documentation, we could first ask basic questions about what a technology does, how two approaches differ, why a certain problem might be happening, or what areas we should check when debugging something.

Once we had the basic idea, it was much easier to go into the actual documentation, test things ourselves, and understand what we were seeing.

Of course, generated answers were not something we could just assume were correct. We learned that fairly early as well. An explanation can sound perfectly reasonable and still not match the actual behaviour of the hardware or software.

In the end, the real test setup always had the final say.

So for us, ChatGPT was mainly another learning tool. It helped reduce the time needed to get started with topics we had never worked with before, but it did not remove the need to understand, test, and debug things ourselves.

---

## 8. Scope Was Still Something We Had to Control

Even after dropping AIVM because of its scope, we still had to be careful not to make Smart IV unnecessarily large.

This is easy to do with an IoT project.

Once the basic device works, a desktop dashboard sounds useful. Then remote monitoring sounds useful. Then a mobile app sounds useful. Then you start thinking about cloud storage, authentication, alerts, history, multiple beds, battery backup, and many other features.

Each addition sounds manageable on its own.

Together, they become a large system.

The difference with Smart IV was that we had a clearer core that could be tested independently. Even without the mobile app or cloud side, we could still work on sensing, flow measurement, and control.

That made it easier to build the project in stages instead of depending on the entire system being completed before we could test anything useful.

---

## 9. What I Would Do Differently When Choosing a 3YP

If I were choosing a 3YP topic again, one of the first things I would ask is:

**What is the smallest useful version of this project that we can actually build and demonstrate?**

For Smart IV, that could be one IV setup, one sensor, one controller, and one motor. If that basic setup worked, we could then move on to the next part.

I would also look carefully at the parts of the project with the highest technical risk. If a project has several difficult areas that are all new to the team and all of them must work before anything can be demonstrated, that is something worth thinking about early.

This was one of the main problems with AIVM Rover. SLAM, autonomous navigation, hardware cost, image registration, and integration were all significant challenges at the same time.

Smart IV also had difficult parts, but they could be separated and tested more independently.

That made a big difference.

---

## 10. Dropping the First Idea Was Not Wasted Work

At the time, dropping AIVM Rover felt like going back to the beginning.

We had already spent time looking into SLAM, ROS2, sensors, cameras, simulation, and possible hardware setups. None of that directly became part of Smart IV.

Still, I do not think that time was completely wasted.

The process taught us to look at a project idea in terms of time, budget, technical risk, and integration rather than only asking whether the final result sounded interesting.

That lesson affected how we approached Smart IV.

A 3YP does not need to solve every possible version of a problem. It needs a clear core idea, enough technical depth, and a realistic path towards something that can actually be built and tested.

That sounds obvious now.

It was less obvious when we were choosing the project.

---

## 11. What Came Next

Selecting Smart IV was only the start.

We still had to decide what the device should actually measure, how the flow-control mechanism should work, what hardware to use, how multiple bedside devices could communicate with a nurse station, and how much of the system should depend on the network or cloud.

Some of those early decisions stayed until the end. Others changed once we started building and testing.

That is what I will cover in the next part.

**Next: Part 2 - Before Building Anything: Figuring Out What Smart IV Actually Needed to Do**