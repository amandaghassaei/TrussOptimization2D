# TrussOptimization2D

Live demo at <a href="http://apps.amandaghassaei.com/TrussOptimization2D/" target="_blank">apps.amandaghassaei.com/TrussOptimization2D</a>. 

This is a design and optimization tool for structures that uses real-time simulation feedback to inform the end user.  It uses [Finite Element Analysis](https://ocw.mit.edu/courses/civil-and-environmental-engineering/1-050-solid-mechanics-fall-2004/readings/emech5_04.pdf) to numerically solve for internal forces in 2D truss structures assuming only axial forces in beams.  The beams have high stiffness (EA = 50 GPa m<sup>2</sup>) so that elastic deformations of the structure are negligible.  The advantage of this numerical approach over analytical approaches (such as [Method of Joints](https://en.wikibooks.org/wiki/Statics/Method_of_Joints)) is that it generalizes to statically indeterminate structures.  

Real-time simulation feedback shows the user how to adjust the positions of the nodes to minimize the volume of material used in the beams of the truss (proportional to &Sigma; | F<sub>i</sub> L<sub>i</sub> | for all beams i in the structure).  As you drag a node, a pink arrow indicates the direction of the gradient around the node's current position.  Move nodes in the direction of the gradient to minimize the total material volume.  The gradient is calculated numerically by sampling the space around the selected node's current position, the step size of this sampling is controlled by "Gradient Step Size".  

Add nodes as variables to an automated optimization process either as single nodes or in mirrored pairs by holding down Shift, selecting a single node or a pair of nodes, and hitting Enter.  Once added, you may constrain their x/y position or change the axis of symmetry in your structure through the controls under "Optimization Variables".  Click "Auto Optimize" to begin the automated optimization process.  This process will incrementally adjust the positions of the nodes to minimize the total volume of the beams in the structure until further gains are less than "Gradient Tolerance".  This optimization process (gradient descent) is not guaranteed to find a globally optimal solution, run the optimization process from many initial starting configurations to find other local minima.  

### Instructions:  

* Scroll to zoom, left click and drag to pan.  
* The force on each node is indicated by a grey arrow.  Drag on force vectors to change the applied force at each node.  Right click on a force vector to type in a value for it.  Click on the "Add Force" button and select a node to add an external force to it.  
* Drag nodes to move them, right click to type in an exact position for them.  
* Fixed nodes are indicated with a black square, click on the "Add/Remove Fixed Nodes" button and select a node to toggle its fixed state.  
* Double click on a beam to add a node to it, double click on a node to begin drawing a new beam.  
* Click the "Delete Mode" button and select a node, beam, or external force to remove it.  
* Toggle between viewing geometry, length, internal forces, and tension/compression of beams in the structure using the controls on the left.  Mouse over a beam to get more detailed information about it.  
* Lock external force magnitudes, topology (the connectivity of nodes and beams), and the positions of the nodes by selecting the checkboxes in the upper left.  
* Click "Download Design Info" to save a text file containing geometric information about the current structure.  

Built by [Amanda Ghassaei](http://www.amandaghassaei.com/) as a homework assignment for [Computational Structural Design and Optimization](https://architecture.mit.edu/subject/fall-2016-4450).
