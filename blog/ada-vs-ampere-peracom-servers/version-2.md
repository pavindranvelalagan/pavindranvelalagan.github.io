# A Beginner’s Guide to Ada and Ampere GPU Servers at PeraCom

## 1. Why I Wrote This

When I started working on our Unitree Go2 Edu robotics project, I had almost zero experience with department servers, Linux server workflows, SSH, scratch disks, GPU usage, or running simulations remotely.

My goal was to run robotics and 3D reconstruction related workloads for the Unitree Go2 Edu quadruped robot. For that, I needed tools like ROS 2, Gazebo, RViz, CUDA, and 3D Gaussian Splatting related libraries.

That is when I started exploring the GPU servers in the Department of Computer Engineering, University of Peradeniya.

This blog is for PeraCom students who are new to department servers and want a simple starting point. It is especially useful if you are new to Linux, new to SSH, or new to GPU servers.

This is not official documentation. These notes are based on my own experience, my own testing, and the official department FAQ pages. Some things may change later, so always verify important details with the official FAQ or server admins.

## 2. What This Blog Will Explain

By the end of this blog, you should understand:

- what Ada and Ampere are
- why students use GPU servers
- how to connect to them
- what Tesla has to do with the login process
- why you should not store big files in `/home`
- what scratch storage means
- how to check whether GPUs are free
- why ROS 2 and Gazebo may not work directly
- what beginner mistakes to avoid

This is not a deep technical benchmark. This is a beginner guide to help you get started safely.

## 3. What Is a GPU Server?

A GPU server is a powerful computer in the department that students can access remotely.

You do not sit in front of this machine physically. Instead, you connect to it from your laptop using SSH.

A GPU server is useful when your laptop is not powerful enough for heavy tasks such as:

- machine learning training
- CUDA programs
- robotics simulation
- SLAM experiments
- image processing
- 3D Gaussian Splatting
- large dataset processing
- ROS bag processing

In my case, I wanted to use these servers for a robotics project involving the Unitree Go2 Edu robot, Gazebo simulation, and 3DGS/SLAM related experiments.

## 4. The Two Main Servers in This Blog

The two main servers I tested were:

| Server | Type       | Simple Meaning                                                                    |
|--------|------------|-----------------------------------------------------------------------------------|
| Ada    | GPU server | Stronger machine, better for heavy GPU and large-memory work                      |
| Ampere | GPU server | Still powerful, useful as a fallback and more aligned with Ubuntu 22.04 workflows |

There are other department servers too, such as Tesla, Turing, Kepler, Aiken, and Neumann. But this blog mainly focuses on Ada and Ampere.

## 5. Very Short Summary of Ada

Ada is currently the stronger option for heavy GPU work.

Officially, Ada has:

- Intel Xeon w7-3565X CPU
- 32 cores / 64 threads
- 3 × NVIDIA RTX 6000 Ada Generation GPUs
- 48 GB GPU memory per GPU
- 512 GB RAM
- Ubuntu 24.04.3 LTS

For my Unitree Go2 / 3DGS / SLAM related work, Ada is the better default choice after scratch storage access is fixed.

Best use cases for Ada:

- heavy CUDA work
- PyTorch experiments
- Gaussian Splatting training
- large dataset processing
- SLAM post-processing
- large ROS bag processing
- benchmarking

## 6. Very Short Summary of Ampere

Ampere is also a powerful GPU server.

Officially, Ampere has:

- 2 × Intel Xeon 4215R processors
- 2 × NVIDIA RTX A6000 GPUs
- 48 GB GPU memory per GPU
- 128 GB RAM
- Ubuntu 22.04 based environment
- multiple storage partitions under `/storage`

Ampere is useful because Ubuntu 22.04 is usually more convenient for ROS 2 Humble workflows.

Best use cases for Ampere:

- fallback GPU jobs
- ROS 2 Humble style work
- containerized robotics environments
- smaller GPU experiments
- jobs that do not need Ada’s larger RAM

But always check GPU availability first, because Ampere may already be heavily used by other users.

## 7. How Do You Connect to These Servers?

You connect using SSH.

SSH is a command-line method to log into another computer remotely.

If you are inside the university network, you can usually connect directly.

For Ada:

    ssh eXXXXX@ada.ce.pdn.ac.lk

For Ampere:

    ssh eXXXXX@ampere.ce.pdn.ac.lk

Replace `eXXXXX` with your own E number username.

If you are outside the university network, you usually connect through Tesla first. Tesla acts like a gateway server.

For Ada from outside:

    ssh -J eXXXXX@tesla.ce.pdn.ac.lk eXXXXX@ada.ce.pdn.ac.lk

For Ampere from outside:

    ssh -J eXXXXX@tesla.ce.pdn.ac.lk eXXXXX@ampere.ce.pdn.ac.lk

This `-J` option means “jump through Tesla”.

## 8. What Is Tesla’s Role?

Tesla is not the main GPU server in this blog.

Think of Tesla as an entry gate.

Ada and Ampere are internal department servers. They may not be directly reachable from outside the university network. So when you are at home, you may first enter through Tesla and then reach Ada or Ampere.

Simple idea:

    Your laptop
        ↓
    Tesla
        ↓
    Ada or Ampere

This is normal.

## 9. What If the Server Name Does Not Work?

Sometimes the hostname may not resolve.

For example, this may fail:

    ssh eXXXXX@ada.ce.pdn.ac.lk

or:

    ssh eXXXXX@ampere.ce.pdn.ac.lk

That does not always mean the server is completely down. It may be a DNS or network issue.

The internal IPs are:

| Server | Internal IP   |
|--------|---------------|
| Ada    | `10.40.18.12` |
| Ampere | `10.40.18.10` |

So from inside the department network or from another internal server, you may try:

    ssh eXXXXX@10.40.18.12

for Ada, or:

    ssh eXXXXX@10.40.18.10

for Ampere.

Do not treat this as a permanent replacement for the official hostname. It is just useful when the hostname has issues.

## 10. First Commands to Run After Logging In

After logging into a server, do not immediately start running heavy work.

First check where you are and what resources are available.

Run:

    hostname
    whoami
    groups
    uptime
    free -h
    df -h
    nvidia-smi

What these commands tell you:

| Command      | Meaning                         |
|--------------|---------------------------------|
| `hostname`   | Which server you are on         |
| `whoami`     | Your current username           |
| `groups`     | Which user groups you belong to |
| `uptime`     | How busy the server is          |
| `free -h`    | RAM usage                       |
| `df -h`      | Disk usage                      |
| `nvidia-smi` | GPU usage                       |

The most important one for GPU work is:

    nvidia-smi

This shows whether the GPUs are free or already being used by other people.

## 11. Shared Server Rule

Ada and Ampere are shared servers.

That means other students, researchers, and staff may be using them at the same time.

Before running a heavy job, always check:

    nvidia-smi

If the GPU memory is already almost full, do not start a big job on that GPU.

You can select a specific GPU like this:

    export CUDA_VISIBLE_DEVICES=0

This tells your program to use GPU 0.

But only do this after checking which GPU is actually free.

## 12. What Is `/home`?

When you log into a Linux server, you usually start inside your home directory.

It may look like:

    /home/eXXXXX

This is your personal space.

You can keep small files here, such as:

- scripts
- notes
- SSH config files
- small source code files
- small setup files

But you should not store large files in `/home`.

Do not keep these in `/home`:

- datasets
- ROS bags
- model checkpoints
- large build folders
- Gaussian Splatting outputs
- simulation outputs
- large videos
- large temporary files

In my testing, `/home` was effectively full. Also, it is usually network-mounted storage, so it can be slower than local scratch storage.

## 13. What Is Scratch Storage?

Scratch storage is local storage intended for heavy temporary work.

Use scratch storage for:

- datasets
- builds
- logs
- ROS bags
- model outputs
- temporary experiment files
- large simulation results

For Ada, the scratch location is:

    /scratch1

For Ampere, scratch locations are:

    /storage/scratch1
    /storage/scratch2
    /storage/scratch3

The intended project paths in my case were:

For Ada:

    /scratch1/eXXXXX/unitree_go2/

For Ampere:

    /storage/scratch2/eXXXXX/unitree_go2/

But in my latest test, I could not create these directories because of permission issues.

So the most important rule is:

Do not start real project work until you confirm that your scratch directory is writable.

## 14. How to Check Scratch Access

On Ada, try:

    ls -ld /scratch1
    ls -ld /scratch1/$USER
    touch /scratch1/$USER/test_write

On Ampere, try:

    ls -ld /storage/scratch2
    ls -ld /storage/scratch2/$USER
    touch /storage/scratch2/$USER/test_write

If these commands fail with `Permission denied`, you need to ask the admin to create or confirm your scratch directory.

Do not work around this by using `/home` for large files.

## 15. Are ROS 2 and Gazebo Already Installed?

In my testing, ROS 2 and Gazebo were not available directly in the user environment on Ada or Ampere.

Commands like these did not work:

    ros2 --version
    gazebo --version
    gz sim --version
    rviz2

This is not a complete problem.

It only means you should not depend on the system environment.

A better approach is to use containers.

## 16. What Is a Container?

A container is like a separate software environment packed into one controlled setup.

For example, instead of installing ROS 2 directly on the server, we can use a container that already has:

- Ubuntu 22.04
- ROS 2 Humble
- Gazebo
- RViz2
- required libraries

This is useful because students usually do not have `sudo` access on department servers.

On Ada, use Apptainer.

On Ampere, use Singularity.

Simple idea:

    Server
      ↓
    Container
      ↓
    ROS 2 + Gazebo + RViz
      ↓
    Project code

This keeps the server clean and makes your setup easier to reproduce.

## 17. GUI Applications and X11 Forwarding

You can use X11 forwarding to open simple graphical applications from the server on your laptop.

For example:

    xclock

If a small clock window appears, X11 forwarding is working.

But there is an important warning.

X11 forwarding does not always mean GPU-accelerated graphics. In my tests, OpenGL rendering used CPU software rendering through `llvmpipe`.

This means heavy GUI tools like Gazebo and RViz may be slow over normal SSH forwarding.

So for robotics work:

- use the server for compute
- run Gazebo headless when possible
- visualize locally when possible
- use RViz locally if practical
- copy output files to your laptop for viewing
- avoid judging GPU power from X11 GUI speed

GPU compute and remote GUI rendering are different things.

`nvidia-smi` tells you about GPU compute.  
`glxinfo` tells you about OpenGL rendering.

Do not confuse the two.

## 18. Recommended Beginner Workflow

For a beginner, the safe workflow is:

    1. Connect to Tesla if outside the university network
    2. From Tesla, connect to Ada or Ampere
    3. Run basic checking commands
    4. Check GPU usage using nvidia-smi
    5. Check RAM using free -h
    6. Check disk using df -h
    7. Confirm scratch storage is writable
    8. Create your project folder inside scratch
    9. Use a container for ROS 2 / Gazebo / project tools
    10. Avoid putting large files in /home

Example project folder on Ada:

    mkdir -p /scratch1/$USER/unitree_go2
    cd /scratch1/$USER/unitree_go2

Example project folder on Ampere:

    mkdir -p /storage/scratch2/$USER/unitree_go2
    cd /storage/scratch2/$USER/unitree_go2

Only run these after confirming you have permission.

## 19. Ada or Ampere: Which One Should You Use?

For my Unitree Go2 project, my current decision is:

| Situation                       | Better Choice           |
|---------------------------------|-------------------------|
| Heavy GPU work                  | Ada                     |
| Large RAM requirement           | Ada                     |
| Gaussian Splatting / 3DGS       | Ada                     |
| Large dataset processing        | Ada                     |
| ROS 2 Humble style workflow     | Ampere may be easier    |
| If Ada is busy                  | Ampere                  |
| If Ampere GPUs are already full | Ada                     |
| If scratch access is not fixed  | Do not start heavy work |

My current practical decision:

Use Ada as the primary server after scratch access is fixed.  
Use Ampere as the secondary server when GPU memory is available and scratch access is fixed.

## 20. Beginner Mistakes to Avoid

Avoid these mistakes:

1.  Do not run heavy jobs without checking `nvidia-smi`.

2.  Do not store datasets or build folders in `/home`.

3.  Do not assume ROS 2 or Gazebo is already installed.

4.  Do not assume X11 GUI rendering is GPU accelerated.

5.  Do not start large experiments before confirming scratch write access.

6.  Do not assume a failed hostname means the server is permanently down.

7.  Do not use all GPU resources on a shared server without care.

8.  Do not forget that these machines are shared by many users.

## 21. Useful Command Cheat Sheet

Basic identity checks:

    hostname
    whoami
    groups
    pwd

System load:

    uptime
    free -h
    df -h

GPU status:

    nvidia-smi

Choose a GPU:

    export CUDA_VISIBLE_DEVICES=0

Check Ada scratch:

    ls -ld /scratch1
    ls -ld /scratch1/$USER

Check Ampere scratch:

    ls -ld /storage/scratch1
    ls -ld /storage/scratch2
    ls -ld /storage/scratch3

Create project directory on Ada:

    mkdir -p /scratch1/$USER/unitree_go2
    cd /scratch1/$USER/unitree_go2

Create project directory on Ampere:

    mkdir -p /storage/scratch2/$USER/unitree_go2
    cd /storage/scratch2/$USER/unitree_go2

Start a long-running session:

    tmux new -s unitree

## 22. Final Summary

Ada and Ampere are powerful GPU servers in the Department of Computer Engineering, University of Peradeniya.

For beginners, the main thing is not to memorize every specification. The main thing is to follow a safe workflow.

Connect properly.  
Check the server.  
Check the GPU.  
Check storage.  
Use scratch, not home.  
Use containers for complex software.  
Be careful because the servers are shared.

For my Unitree Go2 robotics project, Ada is the better primary compute server, especially for GPU-heavy and memory-heavy work. Ampere is still useful as a fallback and may be more convenient for Ubuntu 22.04 / ROS 2 Humble style workflows.

But before doing serious work on either server, the first practical step is to confirm a writable scratch directory.

That one step can save a lot of trouble later.
