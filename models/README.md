Ptolemy Models
==============



Location Test
-------------

This uses a temporary accessor to generate fake location data, allowing all
downstream components to be tested without real location hardware running.
I have it set up to use four simulated robots via the WebSockets -> ROS bridge.

### Usage

- Edit the Ptolemy model to update the ROS WebSockets bridge location in
all of the RosPublisher accessors. Also update the topic based on the names
given to the robots.

- Run the normal ROS commands for simulation. Something like
    
    ```
    export ROS_IP=
    export ROS_MASTER_URL=
    export ROS_NAMESPACE=scarab

    roscore
    roslaunch rosbridge_server rosbridge_websocket.launch
    rosrun rviz rviz
    ```

- Use the updated simulation.launch file to run the simulated robots with topics
that better mirror the topics for the real robots.
    
    ```
    # In scarab_ws/src/scarab
    git remote add lab11 https://github.com/lab11/scarab.git
    git fetch --all
    git co lab11/simulation-mirror
    ```
    then
    ```
    roslaunch scarab simulation.launch robot:=<robot_name>
    ```
    You can run the simulation.launch with different names to get multiple
    robots.
    