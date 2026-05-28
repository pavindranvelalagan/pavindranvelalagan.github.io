# Ada vs Ampere for PeraCom GPU Users

## 1. Purpose

This blog is for PeraCom students who already know the basics of Linux, SSH, GPU servers, and remote development, but want a quick practical overview of the Department of Computer Engineering GPU servers **Ada** and **Ampere**.

This is based on my own testing while setting up a Unitree Go2 Edu robotics project involving ROS 2, Gazebo, SLAM, CUDA, and 3D Gaussian Splatting workloads.

This is not official documentation. Treat this as field notes. Always verify important details from the official CE FAQ or server admins.

## 2. TL;DR

For my current Unitree Go2 / 3DGS / SLAM workflow:

| Use Case                            | Recommended Server      |
|-------------------------------------|-------------------------|
| Heavy GPU compute                   | Ada                     |
| Large RAM workloads                 | Ada                     |
| Gaussian Splatting / CUDA / PyTorch | Ada                     |
| Large dataset or ROS bag processing | Ada                     |
| ROS 2 Humble-style environment      | Ampere may be easier    |
| Fallback when Ada is busy           | Ampere                  |
| If scratch permission is not fixed  | Do not start heavy work |

Current decision:

    Primary: Ada
    Secondary: Ampere
    Immediate blocker: writable scratch directory

## 3. Server Snapshot

| Item              | Ada                         | Ampere                                                        |
|-------------------|-----------------------------|---------------------------------------------------------------|
| Hostname          | `ada.ce.pdn.ac.lk`          | `ampere.ce.pdn.ac.lk`                                         |
| Internal IP       | `10.40.18.12`               | `10.40.18.10`                                                 |
| GPU               | 3 × RTX 6000 Ada Generation | 2 × RTX A6000                                                 |
| VRAM              | 48 GB per GPU               | 48 GB per GPU                                                 |
| CPU               | Intel Xeon w7-3565X         | 2 × Intel Xeon 4215R                                          |
| RAM               | ~512 GB                     | ~128 GB                                                       |
| OS                | Ubuntu 24.04.3 LTS          | Ubuntu 22.04.x                                                |
| Container tool    | Apptainer                   | Singularity CE                                                |
| Main scratch path | `/scratch1`                 | `/storage/scratch1`, `/storage/scratch2`, `/storage/scratch3` |

## 4. Access

From inside the university network:

    ssh eXXXXX@ada.ce.pdn.ac.lk
    ssh eXXXXX@ampere.ce.pdn.ac.lk

From outside, use Tesla as the jump host:

    ssh -J eXXXXX@tesla.ce.pdn.ac.lk eXXXXX@ada.ce.pdn.ac.lk
    ssh -J eXXXXX@tesla.ce.pdn.ac.lk eXXXXX@ampere.ce.pdn.ac.lk

If DNS fails from inside the server network, try the internal IP:

    ssh eXXXXX@10.40.18.12   # Ada
    ssh eXXXXX@10.40.18.10   # Ampere

Do not assume DNS failure means the server is completely down.

## 5. Pre-Run Checklist

Before starting any real job:

    hostname
    whoami
    groups
    uptime
    free -h
    df -h
    nvidia-smi

Interpretation:

| Command      | Why it matters                    |
|--------------|-----------------------------------|
| `hostname`   | Avoid running on the wrong server |
| `uptime`     | Check load average                |
| `free -h`    | Check RAM availability            |
| `df -h`      | Check disk pressure               |
| `nvidia-smi` | Check GPU memory and active users |

For CUDA/PyTorch jobs, select a free GPU explicitly:

    export CUDA_VISIBLE_DEVICES=0

Change `0` based on `nvidia-smi`.

## 6. Storage Policy

Do not use `/home` for heavy work.

In my tests, `/home` was effectively full on both servers. It is also not the right place for datasets, builds, ROS bags, model outputs, or temporary experiment files.

Use scratch storage instead.

### Ada

Intended path:

    /scratch1/eXXXXX/unitree_go2/

Check first:

    ls -ld /scratch1
    ls -ld /scratch1/$USER
    touch /scratch1/$USER/test_write

### Ampere

Recommended scratch target from my tests:

    /storage/scratch2/eXXXXX/unitree_go2/

Check first:

    ls -ld /storage/scratch1
    ls -ld /storage/scratch2
    ls -ld /storage/scratch3
    ls -ld /storage/scratch2/$USER
    touch /storage/scratch2/$USER/test_write

If you get `Permission denied`, ask admin to create or confirm your project scratch directory.

Do not silently fall back to `/home`.

## 7. Current Scratch Issue

In my latest test:

    Ada: /scratch1/e21283 could not be created
    Ampere: /storage/scratch2/e21283 could not be created

Both failed due to permission issues.

So the current practical blocker is not server power. It is scratch access.

Before running heavy project work:

    1. Confirm writable scratch path
    2. Create project directory
    3. Run disk test from that exact directory
    4. Only then start builds, datasets, rosbags, or training

## 8. ROS 2 / Gazebo State

In my tested user environment:

    ros2   not found
    gazebo not found
    gz     not found
    rviz2  not found

This was true for both Ada and Ampere during my checks.

So do not assume the system environment is robotics-ready.

Recommended approach:

    Use Apptainer/Singularity container
    Target Ubuntu 22.04
    Install ROS 2 Humble
    Install Gazebo/RViz inside container
    Run project inside container

Server-specific container tools:

| Server | Tool           |
|--------|----------------|
| Ada    | Apptainer      |
| Ampere | Singularity CE |

## 9. Ada Notes

Ada is the better primary server for my project.

Strengths:

- 3 × RTX 6000 Ada Generation GPUs
- ~512 GB RAM
- stronger CPU
- lower load during my latest test
- large local storage
- Apptainer available
- better for heavy 3DGS/CUDA/PyTorch workloads

Weak points:

- Ubuntu 24.04 may be less convenient for ROS 2 Humble
- ROS 2/Gazebo not available directly
- conda was not visible in my tested environment
- scratch permission must be fixed
- X11 OpenGL rendering used software rendering in my test

Best use:

    Gaussian Splatting
    CUDA/PyTorch
    large dataset processing
    large ROS bag processing
    SLAM post-processing
    benchmarking

## 10. Ampere Notes

Ampere is still useful, but I would treat it as secondary for this project.

Strengths:

- 2 × RTX A6000 GPUs
- Ubuntu 22.04, better aligned with ROS 2 Humble
- Singularity CE available
- multiple `/storage/scratch*` partitions
- conda available in my earlier checks

Weak points:

- only ~128 GB RAM compared to Ada
- GPUs were heavily occupied during my latest test
- dual-socket NUMA system
- ROS 2/Gazebo not available directly
- scratch write permission issue
- X11 OpenGL rendering used software rendering in my test

Best use:

    fallback GPU jobs
    Ubuntu 22.04-compatible workflows
    containerized ROS 2 Humble experiments
    smaller GPU workloads
    overflow work when Ada is busy

## 11. X11 / GUI / OpenGL

X11 forwarding worked for simple GUI tools like `xclock`.

But OpenGL rendering used Mesa `llvmpipe` in my tests. That means GUI rendering was CPU-side, not NVIDIA GPU-accelerated.

Important distinction:

    GPU compute: works through CUDA / nvidia-smi
    Remote OpenGL GUI acceleration: not confirmed

So do not judge server GPU capability using Gazebo/RViz over normal X11.

Recommended visualization strategy:

    Run compute on server
    Run Gazebo headless where possible
    Use local RViz/Foxglove when practical
    Record rosbags
    Copy outputs locally for visualization
    Use browser-based 3DGS viewers locally

## 12. Suggested Project Layout

After scratch access is fixed:

### Ada

    mkdir -p /scratch1/$USER/unitree_go2/{src,data,build,logs,models,rosbags}
    cd /scratch1/$USER/unitree_go2

### Ampere

    mkdir -p /storage/scratch2/$USER/unitree_go2/{src,data,build,logs,models,rosbags}
    cd /storage/scratch2/$USER/unitree_go2

Suggested layout:

    unitree_go2/
    ├── src/
    ├── data/
    ├── build/
    ├── logs/
    ├── models/
    └── rosbags/

Keep `/home` only for:

    SSH config
    small scripts
    notes
    symlinks
    shell config

## 13. Practical Workflow

My current recommended workflow:

    1. SSH into server
    2. Check hostname
    3. Check GPU usage
    4. Check RAM and load
    5. Confirm scratch write access
    6. Start tmux session
    7. Enter container
    8. Run project
    9. Store outputs in scratch
    10. Copy only final required outputs back

Useful commands:

    tmux new -s unitree
    nvidia-smi
    watch -n 1 nvidia-smi
    df -h
    free -h
    uptime

If you accidentally get into nested tmux issues:

    unset TMUX
    tmux new -s unitree

## 14. Final Recommendation

For my Unitree Go2 project:

    Primary server: Ada
    Secondary server: Ampere
    Main reason: Ada has stronger GPU, CPU, RAM, and better availability in my latest test
    Main blocker: scratch permission

Use Ada for heavy compute and large-data work.

Use Ampere when:

    Ada is busy
    Ubuntu 22.04 compatibility matters
    the GPUs are free
    scratch access is confirmed

Do not start serious work on either server until:

    nvidia-smi looks acceptable
    df -h looks safe
    scratch path is writable
    /home is avoided

That is the practical minimum checklist.
