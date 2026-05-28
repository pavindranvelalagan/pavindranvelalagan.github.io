# A Beginner’s Guide to Ada and Ampere GPU Servers at PeraCom

## 1. Why I Wrote This

When I started working on our Unitree Go2 Edu robotics project, I had almost zero experience with department servers, HPC workflows, or running simulations remotely.

My goal was to run robotics and 3D reconstruction workloads for the Unitree Go2 Edu quadruped robot. For that, I needed tools like ROS 2, Gazebo, RViz, CUDA, and 3D Gaussian Splatting related libraries.

That is when I started exploring the GPU servers in the Department of Computer Engineering, University of Peradeniya.

This blog is for PeraCom students who are new to department servers and want a simple starting point.

This is not official documentation. These notes are based on my own experience, my own testing, and the official department FAQ pages. Some details may change later, so always verify important things from the official FAQ or server admins.

---

## 2. What This Blog Covers

This blog explains:

* what Ada and Ampere are
* why GPU servers are useful
* how to connect to them
* why Tesla is used as a jump server
* what `/home` and scratch storage mean
* how to check GPU usage
* why ROS 2 and Gazebo may need containers
* what mistakes beginners should avoid

---

## 3. What Is a GPU Server?

A GPU server is a powerful computer that students can access remotely.

You do not physically sit in front of it. You connect to it from your laptop using SSH.

GPU servers are useful for heavy tasks such as:

* machine learning training
* CUDA programs
* robotics simulation
* SLAM experiments
* image processing
* 3D Gaussian Splatting
* large dataset processing
* ROS bag processing

In my case, I needed server resources for the Unitree Go2 Edu robotics project.

---

## 4. Main Servers Mentioned Here

The two GPU servers I looked at were Ada and Ampere.

| Server | Type       | Simple Meaning                                          |
| ------ | ---------- | ------------------------------------------------------- |
| Ada    | GPU server | Stronger machine for heavy GPU and large-memory work    |
| Ampere | GPU server | Powerful GPU server with Ubuntu 22.04-style environment |

There are other department servers too, such as Tesla, Turing, Kepler, Aiken, and Neumann. This blog mainly focuses on Ada and Ampere.

For my own project, I am going to use Ada.

---

## 5. Ada Summary

Ada is the server I selected for my Unitree Go2 / 3DGS / SLAM work.

Ada has:

* Intel Xeon w7-3565X CPU
* 32 cores / 64 threads
* 3 × NVIDIA RTX 6000 Ada Generation GPUs
* 48 GB GPU memory per GPU
* 512 GB RAM
* Ubuntu 24.04.3 LTS

Good use cases for Ada:

* heavy CUDA work
* PyTorch experiments
* Gaussian Splatting training
* large dataset processing
* SLAM post-processing
* large ROS bag processing
* benchmarking

---

## 6. Ampere Summary

Ampere is also a powerful department GPU server.

Ampere has:

* 2 × Intel Xeon 4215R processors
* 2 × NVIDIA RTX A6000 GPUs
* 48 GB GPU memory per GPU
* 128 GB RAM
* Ubuntu 22.04 based environment
* multiple storage partitions under `/storage`

Ampere is useful to know about because Ubuntu 22.04 is commonly used with ROS 2 Humble workflows.

---

## 7. How to Connect

You connect using SSH.

SSH is a command-line method to log into another computer remotely.

From inside the university network (i.e., UOP-WiFi):

```bash
ssh eXXXXX@ada.ce.pdn.ac.lk
ssh eXXXXX@ampere.ce.pdn.ac.lk
```

Replace `eXXXXX` with your own E-number.

From outside the university network, use Tesla as a jump server:

```bash
ssh -J eXXXXX@tesla.ce.pdn.ac.lk eXXXXX@ada.ce.pdn.ac.lk
ssh -J eXXXXX@tesla.ce.pdn.ac.lk eXXXXX@ampere.ce.pdn.ac.lk
```

The `-J` option means “jump through Tesla”.

---

## 8. What Is Tesla’s Role?

Tesla acts like an entry point.

Ada and Ampere are internal department servers. They are not directly reachable from outside the university network.

So the usual path from home is:

```text
Your laptop
    ↓
Tesla
    ↓
Ada or Ampere
```

---

## 9. What If the Server Name Does Not Work?

Sometimes the hostname may not resolve.

For example:

```bash
ssh eXXXXX@ada.ce.pdn.ac.lk
```

may fail because of a DNS or network issue.

The internal IPs are:

| Server | Internal IP   |
| ------ | ------------- |
| Ada    | `10.40.18.12` |
| Ampere | `10.40.18.10` |

From inside the department network or from another internal server, you can try:

```bash
ssh eXXXXX@10.40.18.12   # Ada
ssh eXXXXX@10.40.18.10   # Ampere
```

Do not treat this as a permanent replacement for the official hostname. It is just useful when the hostname has issues.

---

## 10. First Commands After Login

After logging in, first check the server status.

```bash
hostname
whoami
groups
uptime
free -h
df -h
nvidia-smi
```

What they mean:

| Command      | Purpose                       |
| ------------ | ----------------------------- |
| `hostname`   | Shows which server you are on |
| `whoami`     | Shows your username           |
| `groups`     | Shows your user groups        |
| `uptime`     | Shows server load             |
| `free -h`    | Shows RAM usage               |
| `df -h`      | Shows disk usage              |
| `nvidia-smi` | Shows GPU usage               |

For GPU work, the most important command is:

```bash
nvidia-smi
```

It shows which GPUs are free and which are already being used.

---

## 11. Shared Server Rule

Ada and Ampere are shared servers.

Other students, researchers, and staff may be using them at the same time.

Before running GPU-heavy work, always check:

```bash
nvidia-smi
```

To select one GPU manually:

```bash
export CUDA_VISIBLE_DEVICES=0
```

Change `0` depending on which GPU is free.

---

## 12. What Is `/home`?

When you log into a Linux server, you usually start inside your home directory:

```bash
/home/eXXXXX
```

This is your personal space.

Use `/home` only for small files:

* scripts
* notes
* SSH configs
* small source files
* small setup files

Do not use `/home` for:

* datasets
* ROS bags
* model checkpoints
* large builds
* Gaussian Splatting outputs
* simulation outputs
* videos
* temporary experiment files

Large work should go into scratch storage.

---

## 13. What Is Scratch Storage?

Scratch storage is server storage intended for large project work.

Use scratch storage for:

* datasets
* builds
* logs
* ROS bags
* model outputs
* temporary experiment files
* simulation results

Ada scratch location:

```bash
/scratch1
```

Ampere scratch locations:

```bash
/storage/scratch1
/storage/scratch2
/storage/scratch3
```

For my project, the intended Ada workspace is:

```bash
/scratch1/eXXXXX/unitree_go2/
```

**At the time of writing**, I have already filled the scratch storage request form from the FAQ page and I am waiting for the scratch storage allocation.

---

## 14. How to Check Scratch Storage

After scratch storage is allocated, check it like this.

On Ada:

```bash
ls -ld /scratch1
ls -ld /scratch1/$USER
touch /scratch1/$USER/test_write
```

On Ampere:

```bash
ls -ld /storage/scratch2
ls -ld /storage/scratch2/$USER
touch /storage/scratch2/$USER/test_write
```

If the write test works, you can create your project folder there.

For Ada:

```bash
mkdir -p /scratch1/$USER/unitree_go2
cd /scratch1/$USER/unitree_go2
```

---

## 15. Are ROS 2 and Gazebo Already Installed?

In my testing, ROS 2 and Gazebo were not available directly in the user environment on Ada or Ampere.

These commands did not work:

```bash
ros2 --version
gazebo --version
gz sim --version
rviz2
```

That is not a major problem. It only means we should not depend on the system environment.

A better approach is to use containers.

---

## 16. What Is a Container?

A container is a separate software environment packed into a controlled setup.

Instead of installing ROS 2 directly on the server, we can use a container with:

* Ubuntu 22.04
* ROS 2 Humble
* Gazebo
* RViz2
* required libraries

This is useful because students usually do not have `sudo` access on department servers.

On Ada, use Apptainer.

On Ampere, use Singularity.

Basic idea:

```text
Server
  ↓
Container
  ↓
ROS 2 + Gazebo + RViz
  ↓
Project code
```

---

## 17. GUI Applications and X11 Forwarding

X11 forwarding lets you open simple graphical apps from the server on your laptop.

Example:

```bash
xclock
```

If a small clock appears, X11 forwarding works.

But X11 forwarding does not always mean GPU-accelerated graphics.

In my tests, OpenGL rendering used CPU software rendering through `llvmpipe`. So heavy GUI tools like Gazebo and RViz may be slow over normal SSH forwarding.

Important difference:

```text
GPU compute: checked using nvidia-smi
GUI/OpenGL rendering: checked using glxinfo
```

For robotics work, a better approach is:

* run compute on the server
* run Gazebo headless where possible
* use local visualization when possible
* record ROS bags
* copy outputs to your laptop for viewing

---

## 18. Recommended Beginner Workflow

For Ada:

```text
1. Connect to Tesla if outside the university network
2. Connect to Ada
3. Run basic checking commands
4. Check GPU usage with nvidia-smi
5. Check RAM with free -h
6. Check disk usage with df -h
7. Use scratch storage after allocation
8. Create the project folder inside scratch
9. Use a container for ROS 2 / Gazebo
10. Avoid putting large files in /home
```

Example Ada project folder:

```bash
mkdir -p /scratch1/$USER/unitree_go2
cd /scratch1/$USER/unitree_go2
```

---

## 19. Which Server Am I Using?

For my Unitree Go2 project, I am using Ada.

Reason:

| Requirement               | My Choice |
| ------------------------- | --------- |
| Heavy GPU work            | Ada       |
| Large RAM                 | Ada       |
| Gaussian Splatting / 3DGS | Ada       |
| Large dataset processing  | Ada       |
| SLAM / ROS bag processing | Ada       |

Ampere is still useful to know about, especially for students working with Ubuntu 22.04 / ROS 2 Humble style environments.

---

## 20. Beginner Mistakes to Avoid

Avoid these mistakes:

1. Do not run heavy jobs without checking `nvidia-smi`.

2. Do not store datasets or build folders in `/home`.

3. Do not assume ROS 2 or Gazebo is already installed.

4. Do not assume X11 GUI rendering is GPU accelerated.

5. Do not start large work before your scratch allocation is ready.

6. Do not assume a failed hostname means the server is down.

7. Do not use all GPU resources without checking other users.

---

## 21. Useful Command Cheat Sheet

Basic checks:

```bash
hostname
whoami
groups
pwd
```

System checks:

```bash
uptime
free -h
df -h
```

GPU status:

```bash
nvidia-smi
```

Choose a GPU:

```bash
export CUDA_VISIBLE_DEVICES=0
```

Check Ada scratch:

```bash
ls -ld /scratch1
ls -ld /scratch1/$USER
```

Create Ada project directory:

```bash
mkdir -p /scratch1/$USER/unitree_go2
cd /scratch1/$USER/unitree_go2
```

Start a long-running session:

```bash
tmux new -s unitree
```

---

## 22. Final Summary

Ada and Ampere are powerful GPU servers in the Department of Computer Engineering, University of Peradeniya.

For beginners, the main idea is simple:

```text
Connect properly.
Check the server.
Check the GPU.
Use scratch, not /home.
Use containers for complex software.
Be careful because the servers are shared.
```

For my Unitree Go2 robotics project, I am using Ada because it is better for GPU-heavy and memory-heavy work.

**Some details may change later, so always verify important things from the official FAQ or server admins (Links attached below).**
