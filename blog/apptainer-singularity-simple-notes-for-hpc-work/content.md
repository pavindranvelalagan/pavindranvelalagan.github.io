## 1. Purpose

This note gives a practical introduction to Apptainer, also commonly known as Singularity, for students and researchers working on shared servers or HPC (High Performance Computing) systems.

It focuses on why containers are useful, how Apptainer fits HPC workflows, and how to use SIF images, bind mounts, scratch storage, GPU access, and basic commands in a clean project setup.

This is written as practical field notes rather than official documentation. Always verify server-specific details with the cluster administrators or official server documentation.

## 2. TL;DR

Apptainer is useful when the server environment does not match the software environment required by a project.

| Need | Apptainer role |
|------|----------------|
| Different Ubuntu version | Run the required userspace inside a container |
| No `sudo` access | Use a prepared image instead of installing on the host |
| ROS 2 / CUDA / PyTorch dependencies | Keep project dependencies isolated |
| Shared HPC server | Run safely with normal user permissions |
| GPU workloads | Use host NVIDIA drivers through `--nv` |
| Large files | Store data, builds, and outputs in scratch |

Basic idea:

    Server gives hardware and storage.
    Apptainer gives the software environment.
    Bind mounts connect project files into the container.
    SIF files make the environment portable.

## 3. The Big Picture

When we work on a normal laptop, installing software is usually simple. We can use apt, pip, conda, or build things from source. But on a shared server or HPC system, it becomes more complicated.

The server may have a different operating system version. We may not have `sudo` access. Different projects may need different software versions. One project may need Ubuntu 22.04, another may need Ubuntu 24.04. One project may need ROS 2 Humble, another may need CUDA, PyTorch, OpenCV, Gazebo, or some old library version.

This is where containers become useful.

A container is a way to package a software environment so that it can run in a controlled and repeatable way. Instead of installing everything directly on the server, we run the software inside a prepared environment.

So the basic idea is:

    Host machine:
      real server, real CPU, real GPU, real storage, real network

    Container:
      packaged software environment
      specific OS userspace
      specific libraries
      specific tools

The container does not replace the server. It just gives us a clean software environment on top of the server.


## 4. What problem do containers solve?

Containers mainly solve the “it works on my machine” problem.

Example:

    My laptop:
      Ubuntu 22.04
      ROS 2 Humble
      Python 3.10

    Server:
      Ubuntu 24.04
      no ROS 2 Humble packages
      no sudo access

If I try to install ROS 2 Humble directly on the server, it may not work properly because Humble is meant for Ubuntu 22.04. But if I use a container with Ubuntu 22.04 inside it, then I can run ROS 2 Humble inside that container while the server itself still runs Ubuntu 24.04.

This gives us a clean separation:

    Server OS:
      stays as it is

    Project environment:
      lives inside container

That is the main reason containers are very useful in research and HPC work.


## 5. Containers vs virtual machines

Containers and virtual machines are related ideas, but they are not the same.

A virtual machine is like running a full computer inside another computer. It has its own virtual hardware, its own kernel, its own boot process, and its own full operating system.

A container is lighter. It does not run a separate kernel. It uses the host machine’s kernel, but gives the application its own filesystem and software environment.

Simple difference:

| Type | Characteristics |
|------|-----------------|
| Virtual machine | Heavy; has its own kernel; behaves like a full separate computer |
| Container | Lighter; uses the host kernel; packages the software environment |

For HPC and servers, containers are usually better than virtual machines because they are lighter and closer to native performance.


## 6. Common ways to manage environments

There are several tools people use to manage software environments.

### System packages

Example:

    sudo apt install package-name

This installs software directly on the machine. Good for personal machines, but not ideal on shared servers because users normally do not have `sudo`.

### Python virtual environments

Example:

    python3 -m venv venv
    source venv/bin/activate

Good for Python-only projects. But not enough when the project needs system libraries, ROS, CUDA, Gazebo, or a specific Ubuntu version.

### Conda

Conda is useful for Python, data science, ML, and package management. But it still may not fully solve OS-level dependency problems.

### Docker

Docker is very popular in industry and web development. It is good for building and running containers. But on shared HPC systems, Docker is often not allowed for normal users because it usually depends on a daemon (background process) and can create security issues.

### Apptainer / Singularity

Apptainer is designed for HPC and shared server environments. It lets users run containers without needing Docker access. It works well with shared filesystems, scratch storage, GPUs, and batch schedulers.

That is why Apptainer is common in universities, research labs, and HPC clusters.


## 7. What is Apptainer?

Apptainer is a container platform.

It lets us create and run portable software environments. It was previously known as Singularity. In many older tutorials, documents, and server guides, people still say “Singularity”. In newer systems, the command is often called `apptainer`.

So practically:

| Name | Meaning |
|------|---------|
| Singularity | Older/common name |
| Apptainer | Current open-source community name |

In day-to-day use, they are very similar. If someone says “use Singularity on the cluster”, they usually mean the same style of workflow as Apptainer.

On a server, we may see either:

    singularity

or:

    apptainer

On newer systems, `apptainer` is more likely.


## 8. Why Apptainer is popular in HPC

Apptainer fits HPC better than Docker for a few reasons.

First, it does not require normal users to run a Docker daemon (background process). That is important on shared servers.

Second, it runs containers using the user’s normal permissions. If I am user `e21283`, files I create from inside the container are still created as my user on the host. This is safer and cleaner for shared systems.

Third, Apptainer works well with shared storage. We can bind our project folder into the container and work normally.

Fourth, Apptainer supports GPU access. For NVIDIA GPUs, we can use options like:

    apptainer shell --nv image.sif

This lets the container use the host GPU driver and CUDA-related libraries.

Fifth, Apptainer images are usually stored as single `.sif` files. This is convenient on HPC systems because one image file can be copied, shared, checked, and reused.


## 9. What is a `.sif` file?

Apptainer commonly uses SIF files.

SIF means:

    Singularity Image Format

A `.sif` file is the container image. It contains the filesystem and software environment.

Example:

    ros2_humble_gazebo.sif

This file may contain:

    Ubuntu 22.04 userspace
    ROS 2 Humble
    Gazebo
    colcon
    Python packages
    system libraries
    development tools

When we run the SIF file, Apptainer starts a container using that image.

Example:

    apptainer shell ros2_humble_gazebo.sif

Then we enter the container shell.


## 10. Important commands

### Check if Apptainer exists

    which apptainer

Example output:

    /usr/bin/apptainer

### Pull an image

Apptainer can pull from Docker-style image sources and convert them into a SIF file.

Example:

    apptainer pull ubuntu_22.sif docker://ubuntu:22.04

This downloads the image and stores it as:

    ubuntu_22.sif

After that, we can run the local SIF file again and again.

### Enter a container

    apptainer shell ubuntu_22.sif

This gives an interactive shell inside the container.

### Run a command inside a container

    apptainer exec ubuntu_22.sif cat /etc/os-release

This runs only one command inside the container and returns.

### Run the container

    apptainer run image.sif

This runs the container’s default runscript, if it has one.


## 11. Bind mounts

A container has its own filesystem. But our real project files are usually on the host server.

So we use bind mounts.

A bind mount maps a host directory into the container.

Example:

    apptainer shell \
      --bind /scratch1/my_project:/workspace \
      image.sif

This means:

| Location | Path |
|----------|------|
| On host | `/scratch1/my_project` |
| Inside container | `/workspace` |

So when I go inside the container and write:

    cd /workspace
    touch test.txt

the file is actually created on the host at:

    /scratch1/my_project/test.txt

This is very important. The container is not where we should permanently store project output. The real storage is still the server’s filesystem.


## 12. Home storage vs scratch storage

On HPC systems, there is usually a small home directory and a larger scratch directory.

Home directory:

    /home/username

Usually this is network-mounted storage (i.e., NFS). It is good for small files like shell configs, SSH keys, and small notes.

Scratch directory:

    /scratch1/project_name

This is better for big project files like:

    container images
    datasets
    build folders
    logs
    rosbags
    models
    simulation outputs

For container work, it is better to keep large files in scratch.

A good project layout can look like this:

    /scratch1/my_project
    ├── containers
    ├── src
    ├── build
    ├── install
    ├── data
    ├── logs
    ├── models
    └── rosbags

This keeps the home directory clean and avoids filling up NFS storage.


## 13. Apptainer cache

When Apptainer pulls images, it may use a cache directory. By default, this can go inside the home directory.

That is not ideal if the home storage is small.

So we can redirect the cache to scratch:

    export APPTAINER_CACHEDIR=/scratch1/my_project/containers/cache
    export APPTAINER_TMPDIR=/scratch1/my_project/containers/tmp

Then large temporary files and downloaded layers go to scratch instead of home.

This is a good habit on HPC systems.


## 14. Building images

There are two main ways to get a container image.

### Pull an existing image

Example:

    apptainer pull ros.sif docker://osrf/ros:humble-desktop

This is simple when a suitable image already exists.

### Build a custom image

For a custom image, we use a definition file.

Example:

    ros2_humble_gazebo.def

A definition file says:

    start from this base image
    install these packages
    set these environment variables
    define what happens when the container runs

Then we build it:

    apptainer build ros2_humble_gazebo.sif ros2_humble_gazebo.def

On many HPC systems, normal users cannot build images with root privileges unless fakeroot is enabled. If fakeroot is not configured, we may need the admin to build the image once.

This is normal in shared servers.


## 15. Fakeroot

Sometimes we need root privileges inside the image build process because installing packages with `apt` requires root.

Apptainer has a feature called fakeroot. It lets a normal user behave like root inside the container build environment, without becoming real root on the server.

But fakeroot must be supported by the server configuration.

If fakeroot is not enabled, an error may appear when trying:

    apptainer build --fakeroot image.sif image.def

In that case, the options are:

    ask admin to enable fakeroot
    ask admin to build the image
    build the image on another machine and copy the SIF file
    use an existing prebuilt image

For running containers, fakeroot is usually not needed. It is mainly needed when building custom images.


## 16. GPU usage

If the server has NVIDIA GPUs, Apptainer can expose them to the container using:

    apptainer shell --nv image.sif

The container still uses the host machine’s GPU driver. So the GPU driver must be installed properly on the host.

A common ML/HPC workflow is:

    apptainer exec --nv pytorch.sif python train.py

This runs `train.py` inside the container while using the server GPU.

This is useful because we can have a clean Python/PyTorch/CUDA environment inside the container without modifying the server.


## 17. Docker vs Apptainer

Docker and Apptainer both run containers, but they are used in different environments.

Common usage:

| Tool | Common environments |
|------|---------------------|
| Docker | Web development, deployment, microservices, local development, cloud systems |
| Apptainer | HPC clusters, research servers, university compute servers, GPU servers, batch job environments |

Docker usually needs Docker daemon access. On shared servers, users may not have permission to use Docker.

Apptainer is more suitable when many users share the same server and do not have admin access.

Also, Apptainer can still use Docker images as sources. For example:

    apptainer pull image.sif docker://ubuntu:22.04

This does not mean we are running Docker. It only means Apptainer is downloading a Docker-format image and converting it into a SIF file.


## 18. A simple HPC workflow with Apptainer

A normal workflow can look like this:

    cd /scratch1/my_project

    mkdir -p containers/cache containers/tmp src build install logs

    export APPTAINER_CACHEDIR=/scratch1/my_project/containers/cache
    export APPTAINER_TMPDIR=/scratch1/my_project/containers/tmp

    apptainer pull containers/ubuntu_22.sif docker://ubuntu:22.04

    apptainer shell \
      --bind /scratch1/my_project:/workspace \
      containers/ubuntu_22.sif

Inside the container:

    cd /workspace

Now `/workspace` is the project folder.

If this is a ROS project, the workflow may be:

    source /opt/ros/humble/setup.bash
    colcon build --base-paths src --build-base build --install-base install
    source install/setup.bash
    ros2 run package_name node_name

All the files are still saved in scratch storage.


## 19. How I use Apptainer on an HPC server

In my setup, the server runs Ubuntu 24.04, but I need software that works better on Ubuntu 22.04.

Instead of trying to install everything directly on the server, I use an Apptainer container with Ubuntu 22.04 inside it.

The server remains unchanged:

    Host:
      Ubuntu 24.04

The project environment is inside the container:

    Container:
      Ubuntu 22.04
      required project software

My project files stay in scratch storage:

    /scratch1/my_project

Inside the container, I bind that folder as:

    /workspace

So the workflow is:

    SSH into server
    go to scratch folder
    enter Apptainer container
    work inside /workspace
    build/run/test software
    outputs are saved back to scratch

This is clean because I do not need to modify the server OS. It is also reproducible because the same SIF image can be used again later.


## 20. What Apptainer is not

Apptainer is not a full virtual machine.

It does not give a completely separate computer. It uses the host kernel.

Apptainer is also not magic. If the host does not have a GPU driver, the container cannot create a GPU driver by itself. If the admin disables some feature, the container cannot bypass it.

Apptainer is also not a replacement for proper project organization. We still need clean folders, logs, scripts, and documentation.

The container only solves the software environment problem.


## 21. Good habits

Use scratch for large files.

Keep the SIF image inside the project folder.

Set Apptainer cache and temp directories to scratch.

Use a small script to enter the container.

Example:

    #!/usr/bin/env bash

    PROJECT_ROOT=/scratch1/my_project

    export APPTAINER_CACHEDIR=$PROJECT_ROOT/containers/cache
    export APPTAINER_TMPDIR=$PROJECT_ROOT/containers/tmp

    apptainer shell \
      --bind $PROJECT_ROOT:/workspace \
      --pwd /workspace \
      $PROJECT_ROOT/containers/my_image.sif

Then enter the environment using:

    bash scripts/enter_container.sh

This avoids typing long commands every time.

Also keep logs of what was tested:

    logs/commands/

This helps when something breaks later.


## 22. Final summary

Apptainer is a container tool mainly used in HPC and research environments.

It helps us run a clean software environment without changing the server OS.

It is especially useful when:

    we do not have sudo
    the server OS is not the one we need
    different projects need different dependencies
    we want reproducible environments
    we need GPU support on a shared server
    we want to keep big files in scratch storage

The main idea is simple:

    Server gives hardware and storage.
    Apptainer gives the software environment.
    Bind mounts connect project files into the container.
    SIF files make the environment portable.

That is why Apptainer is very useful for undergrad research projects, robotics projects, ML experiments, simulations, and any work done on shared HPC servers.
