import React, { useState } from 'react';

const Scene = () => {
  const [currentShape, setCurrentShape] = useState('cube');
  const mountRef = React.useRef(null);
  const sceneRef = React.useRef(null);
  const frameId = React.useRef(null);
  
  // Momentum values
  const momentumRef = React.useRef({ x: 0, y: 0 });
  const lastDeltaRef = React.useRef({ x: 0, y: 0 });
  
  const createGeometry = (shape) => {
    switch (shape) {
      case 'sphere':
        return new THREE.SphereGeometry(1.5, 32, 32);
      case 'cylinder':
        return new THREE.CylinderGeometry(1, 1, 2, 32);
      case 'torus':
        return new THREE.TorusGeometry(1, 0.4, 16, 100);
      case 'cone':
        return new THREE.ConeGeometry(1, 2, 32);
      case 'octahedron':
        return new THREE.OctahedronGeometry(1.5);
      default: // cube
        return new THREE.BoxGeometry(2, 2, 2);
    }
  };

  React.useEffect(() => {
    if (!mountRef.current || !window.THREE) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x2a2a2a);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Create shape
    const geometry = createGeometry(currentShape);
    const material = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      flatShading: true,
      specular: 0x444444,
      shininess: 30,
    });
    const shape = new THREE.Mesh(geometry, material);
    scene.add(shape);

    // Add lights
    const light1 = new THREE.DirectionalLight(0xffffff, 1);
    light1.position.set(1, 1, 1);
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
    light2.position.set(-1, -1, -1);
    scene.add(light2);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Mouse interaction variables
    let isDragging = false;
    let previousMousePosition = {
      x: 0,
      y: 0,
    };

    // Event handlers
    const handleMouseDown = () => {
      isDragging = true;
      momentumRef.current = { x: 0, y: 0 };
    };

    const handleMouseMove = (e) => {
      if (isDragging) {
        const deltaMove = {
          x: e.offsetX - previousMousePosition.x,
          y: e.offsetY - previousMousePosition.y,
        };

        shape.rotation.y += deltaMove.x * 0.01;
        shape.rotation.x += deltaMove.y * 0.01;

        // Store the delta for momentum
        lastDeltaRef.current = {
          x: deltaMove.x * 0.01,
          y: deltaMove.y * 0.01,
        };
      }

      previousMousePosition = {
        x: e.offsetX,
        y: e.offsetY,
      };
    };

    const handleMouseUp = () => {
      isDragging = false;
      // Set momentum on release
      momentumRef.current = {
        x: lastDeltaRef.current.x * 0.95,
        y: lastDeltaRef.current.y * 0.95,
      };
    };

    // Window resize handler
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    // Add event listeners
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('resize', handleResize);

    // Animation loop with momentum
    const animate = () => {
      frameId.current = requestAnimationFrame(animate);

      if (!isDragging) {
        // Apply momentum
        shape.rotation.y += momentumRef.current.x;
        shape.rotation.x += momentumRef.current.y;

        // Gradually reduce momentum
        momentumRef.current.x *= 0.99;
        momentumRef.current.y *= 0.99;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
      
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [currentShape]); // Re-run effect when shape changes

  return (
    <div className="relative h-screen w-full">
      {/* Shape Selection Bar */}
      <div className="absolute top-0 left-0 right-0 bg-gray-800 p-4 flex justify-center gap-4 z-10">
        {['cube', 'sphere', 'cylinder', 'torus', 'cone', 'octahedron'].map((shape) => (
          <button
            key={shape}
            onClick={() => setCurrentShape(shape)}
            className={`px-4 py-2 rounded ${
              currentShape === shape
                ? 'bg-green-500 text-white'
                : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
            }`}
          >
            {shape.charAt(0).toUpperCase() + shape.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Instructions */}
      <div className="absolute top-20 w-full text-center text-white font-sans pointer-events-none z-10">
        Click and drag to rotate the shape
      </div>
      
      {/* Three.js Container */}
      <div ref={mountRef} className="h-full w-full" />
    </div>
  );
};

export default Scene;

/*
import React, { useState } from 'react';

const Scene = () => {
  const [currentShape, setCurrentShape] = useState('cube');
  const mountRef = React.useRef(null);
  const sceneRef = React.useRef(null);
  const frameId = React.useRef(null);
  const meshRef = React.useRef(null);
  
  // Physics state
  const velocityRef = React.useRef({ x: 0, y: 0, z: 0 });
  const isDraggingRef = React.useRef(false);
  const mousePositionRef = React.useRef({ x: 0, y: 0 });
  const lastMouseVelocity = React.useRef({ x: 0, y: 0 });
  
  const createGeometry = (shape) => {
    switch (shape) {
      case 'sphere':
        return new THREE.SphereGeometry(1.5, 32, 32);
      case 'cylinder':
        return new THREE.CylinderGeometry(1, 1, 2, 32);
      case 'cone':
        return new THREE.ConeGeometry(1, 2, 32);
      default: // cube
        return new THREE.BoxGeometry(2, 2, 2);
    }
  };

  React.useEffect(() => {
    if (!mountRef.current || !window.THREE) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x2a2a2a);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 10;
    camera.position.y = 5;
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Create shape
    const geometry = createGeometry(currentShape);
    const material = new THREE.MeshPhongMaterial({
      color: 0x00ff00,
      flatShading: true,
      specular: 0x444444,
      shininess: 30,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    scene.add(mesh);
    meshRef.current = mesh;

    // Add lights
    const light1 = new THREE.DirectionalLight(0xffffff, 1);
    light1.position.set(1, 1, 1);
    light1.castShadow = true;
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
    light2.position.set(-1, -1, -1);
    scene.add(light2);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Mouse interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getMousePosition = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      return { x: mouse.x, y: mouse.y };
    };

    const handleMouseDown = (event) => {
      const mousePos = getMousePosition(event);
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(mesh);
      
      if (intersects.length > 0) {
        isDraggingRef.current = true;
        mousePositionRef.current = mousePos;
        velocityRef.current = { x: 0, y: 0, z: 0 };
      }
    };

    const handleMouseMove = (event) => {
      if (isDraggingRef.current) {
        const newMousePos = getMousePosition(event);
        
        // Calculate mouse velocity for throwing
        lastMouseVelocity.current = {
          x: (newMousePos.x - mousePositionRef.current.x) * 20,
          y: (newMousePos.y - mousePositionRef.current.y) * 20
        };
        
        // Update object position based on mouse movement
        raycaster.setFromCamera(mouse, camera);
        const intersectPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(intersectPlane, intersectPoint);
        
        mesh.position.x = intersectPoint.x * 10;
        mesh.position.y = intersectPoint.y * 10;
        
        mousePositionRef.current = newMousePos;
      }
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        velocityRef.current = {
          x: lastMouseVelocity.current.x * 20,
          y: lastMouseVelocity.current.y * 20,
          z: 0
        };
      }
    };

    // Physics simulation
    const updatePhysics = () => {
      if (!isDraggingRef.current) {
        // Apply gravity
        velocityRef.current.y -= 0.1;
        
        // Update position
        mesh.position.x += velocityRef.current.x * 0.1;
        mesh.position.y += velocityRef.current.y * 0.1;
        mesh.position.z += velocityRef.current.z * 0.1;
        
        // Boundary collisions
        const bounds = {
          x: 10,
          y: 5,
          z: 10
        };
        
        // X-axis bounds
        if (Math.abs(mesh.position.x) > bounds.x) {
          mesh.position.x = Math.sign(mesh.position.x) * bounds.x;
          velocityRef.current.x *= -0.8; // Bounce with energy loss
        }
        
        // Y-axis bounds
        if (Math.abs(mesh.position.y) > bounds.y) {
          mesh.position.y = Math.sign(mesh.position.y) * bounds.y;
          velocityRef.current.y *= -0.8;
        }
        
        // Z-axis bounds
        if (Math.abs(mesh.position.z) > bounds.z) {
          mesh.position.z = Math.sign(mesh.position.z) * bounds.z;
          velocityRef.current.z *= -0.8;
        }
        
        // Apply drag
        velocityRef.current.x *= 0.99;
        velocityRef.current.y *= 0.99;
        velocityRef.current.z *= 0.99;
        
        // Add rotation based on movement
        mesh.rotation.x += velocityRef.current.y * 0.01;
        mesh.rotation.y += velocityRef.current.x * 0.01;
      }
    };

    // Animation loop
    const animate = () => {
      frameId.current = requestAnimationFrame(animate);
      updatePhysics();
      renderer.render(scene, camera);
    };

    animate();

    // Add event listeners
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);

    // Window resize handler
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
      
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [currentShape]);

  return (
    <div className="relative h-screen w-full">
      <div className="absolute top-0 left-0 right-0 bg-gray-800 p-4 flex justify-center gap-4 z-10">
        {['cube', 'sphere', 'cylinder', 'cone'].map((shape) => (
          <button
            key={shape}
            onClick={() => setCurrentShape(shape)}
            className={`px-4 py-2 rounded ${
              currentShape === shape
                ? 'bg-green-500 text-white'
                : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
            }`}
          >
            {shape.charAt(0).toUpperCase() + shape.slice(1)}
          </button>
        ))}
      </div>
      
      <div className="absolute top-20 w-full text-center text-white font-sans pointer-events-none z-10">
        Click and drag to throw the shape around
      </div>
      
      <div ref={mountRef} className="h-full w-full" />
    </div>
  );
};

export default Scene;
*/