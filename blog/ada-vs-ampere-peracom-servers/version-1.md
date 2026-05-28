# Ada GPU Server for PeraCom Users

## 1. Purpose

This blog is for PeraCom students who already know the basics of Linux, SSH, GPU servers, and remote development, but want a quick practical overview of the Department of Computer Engineering GPU server Ada.

This is based on my own testing while setting up a Unitree Go2 Edu robotics project involving ROS 2, Gazebo, SLAM, CUDA, and 3D Gaussian Splatting workloads.

This is not official documentation. Treat this as field notes. Always verify important details from the official CE FAQ or server admins.

## 2. TL;DR

For my current Unitree Go2 / 3DGS / SLAM workflow, I am planning to use Ada.

| Use Case                            | Server |
|-------------------------------------|--------|
| Heavy GPU compute                   | Ada    |
| Large RAM workloads                 | Ada    |
| Gaussian Splatting / CUDA / PyTorch | Ada    |
| Large dataset or ROS bag processing | Ada    |
| ROS 2 / Gazebo work                 | Ada, using a container |

Current decision:

    Server: Ada
    Scratch status: **At the time of writing**, I have filled the scratch storage request form from the FAQ page and I am waiting for the allocation.

## 3. Server Snapshot

| Item              | Ada                         |
|-------------------|-----------------------------|
| Hostname          | `ada.ce.pdn.ac.lk`          |
| Internal IP       | `10.40.18.12`               |
| GPU               | 3 × RTX 6000 Ada Generation |
| VRAM              | 48 GB per GPU               |
| CPU               | Intel Xeon w7-3565X         |
| RAM               | ~512 GB                     |
| OS                | Ubuntu 24.04.3 LTS          |
| Container tool    | Apptainer                   |
| Main scratch path | `/scratch1`                 |

## 4. Access

From inside the university network:

    ssh eXXXXX@ada.ce.pdn.ac.lk

From outside, use Tesla as the jump host:

    ssh -J eXXXXX@tesla.ce.pdn.ac.lk eXXXXX@ada.ce.pdn.ac.lk

If DNS fails from inside the server network, try the internal IP:

    ssh eXXXXX@10.40.18.12   # Ada

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

In my tests, `/home` was effectively full. It is also not the right place for datasets, builds, ROS bags, model outputs, or temporary experiment files.

Use scratch storage instead.

For Ada, the intended project path is:

    /scratch1/eXXXXX/unitree_go2/

Do not silently fall back to `/home`.

## 7. Scratch Storage Status

For project work, scratch storage should be requested through the form linked in the department FAQ page.

Current status:

    **At the time of writing**, I have filled the scratch storage request form from the FAQ page and I am waiting for the allocation.

Once allocated, I will use the assigned scratch path for:

    datasets
    ROS bags
    build files
    logs
    model outputs
    Gaussian Splatting outputs
    temporary experiment files

## 8. ROS 2 / Gazebo State

In my tested Ada user environment:

    ros2   not found
    gazebo not found
    gz     not found
    rviz2  not found

So do not assume the system environment is robotics-ready.

Recommended approach:

    Use an Apptainer container
    Target Ubuntu 22.04
    Install ROS 2 Humble
    Install Gazebo/RViz inside the container
    Run project inside the container

Server-specific container tool:

| Server | Tool      |
|--------|-----------|
| Ada    | Apptainer |

## 9. Ada Notes

Ada is the server I am planning to use for this project.

Strengths:

- 3 × RTX 6000 Ada Generation GPUs
- ~512 GB RAM
- strong CPU
- large local storage
- Apptainer available
- good for heavy 3DGS/CUDA/PyTorch workloads

Things to keep in mind:

- Ubuntu 24.04 may be less convenient for ROS 2 Humble
- ROS 2/Gazebo not available directly
- conda was not visible in my tested environment
- X11 OpenGL rendering used software rendering in my test

Best use:

    Gaussian Splatting
    CUDA/PyTorch
    large dataset processing
    large ROS bag processing
    SLAM post-processing
    benchmarking

## 10. X11 / GUI / OpenGL

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

## 11. Suggested Project Layout

After scratch storage is allocated:

    mkdir -p /scratch1/$USER/unitree_go2/{src,data,build,logs,models,rosbags}
    cd /scratch1/$USER/unitree_go2

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

## 12. Practical Workflow

My current recommended workflow:

    1. SSH into Ada
    2. Check hostname
    3. Check GPU usage
    4. Check RAM and load
    5. Use the allocated scratch path
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

## 13. Final Recommendation

For my Unitree Go2 project:

    Server: Ada
    Main reason: Ada has strong GPU, CPU, RAM, and storage capacity

Use Ada for heavy compute and large-data work.

Before starting serious work:

    nvidia-smi should look acceptable
    df -h should look safe
    the allocated scratch path should be used
    /home should be avoided

That is the practical minimum checklist.

**Some details may change later, so always verify important things from the official FAQ or server admins (Links attached below).**