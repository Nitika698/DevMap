import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaYoutube,
  FaGlobe,
} from "react-icons/fa";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";
import { fetchRoadmapByTopic, updateRoadmapStep, updateResourceComplete } from "../services/roadmapApi";

function Roadmap() {
  const { topic } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const level = searchParams.get("level") || "Beginner";
  const duration = searchParams.get("duration") || "3 Months";

  const [roadmapData, setRoadmapData] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const getStatusProgress = () => {
  const countNodes = (node) => {
    if (!node) return { total: 0, completed: 0 };

    let total = 1;
    let completed = node.status === "green" ? 1 : 0;

    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        const childCounts = countNodes(child);
        total += childCounts.total;
        completed += childCounts.completed;
      });
    }

    return { total, completed };
  };

  const roadmapRoot = roadmapData?.roadmap;
  if (!roadmapRoot) return 0;

  const { total, completed } = countNodes(roadmapRoot);
  return total > 0 ? Math.round((completed / total) * 100) : 0;
};
  const progress = useMemo(() => {
    if (!roadmapData?.roadmap) return 0;
    return getStatusProgress();
  }, [roadmapData]);

  useEffect(() => {
    const getRoadmap = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await fetchRoadmapByTopic(topic, level, duration);
        setRoadmapData(data.roadmap);

        if (data.roadmap?.roadmap) {
          setSelectedStep(data.roadmap.roadmap);
        }
      } catch (err) {
        console.error("Roadmap Fetch Error:", err);
        setError(err.message || "Failed to load roadmap");
      } finally {
        setLoading(false);
      }
    };

    if (topic) {
      getRoadmap();
    }
  }, [topic, level, duration]);

  useEffect(() => {
    if (roadmapData) {
      console.log(" Full Roadmap Data:", roadmapData);
      console.log(" Roadmap Tree Root:", roadmapData.roadmap);
      console.log("Children count:", roadmapData.roadmap?.children?.length);
      console.log(
        "Full Structure:",
        JSON.stringify(roadmapData.roadmap, null, 2),
      );
    }
  }, [roadmapData]);

const handleResourceComplete = async (resourceLink, completed) => {
  try {
    const data = await updateResourceComplete(
      roadmapData._id,
      selectedStep.title,
      resourceLink,
      completed
    );
    setRoadmapData(data.roadmap);  

    const findNode = (node) => {
      if (node.title === selectedStep.title) return node;
      if (node.children) {
        for (let child of node.children) {
          const found = findNode(child);
          if (found) return found;
        }
      }
      return null;
    };

    const updated = findNode(data.roadmap.roadmap);
    if (updated) setSelectedStep(updated);

  } catch (err) {
    console.error("Resource update error:", err);
    alert("Failed to update resource");
  }
};

  const handleStatusChange = async (step, newStatus) => {
  try {
    const updated = await updateRoadmapStep(roadmapData._id, step, newStatus);
    setRoadmapData(updated.roadmap);   
    const findUpdatedStep = (node) => {
      if (node.title === step) return node;
      if (node.children) {
        for (let child of node.children) {
          const found = findUpdatedStep(child);
          if (found) return found;
        }
      }
      return null;
    };

    const newSelected = findUpdatedStep(updated.roadmap.roadmap);
    if (newSelected) setSelectedStep(newSelected);

  } catch (err) {
    console.error("Update Error:", err);
    alert("Failed to update step status");
  }
};

  const getStatusStyles = (status) => {
    switch (status) {
      case "green":
        return "bg-green-100 text-green-700";
      case "yellow":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-red-100 text-red-700";
    }
  };

  const getNodeColor = (status) => {
    switch (status) {
      case "green":
        return "#10b981";
      case "yellow":
        return "#f59e0b";
      default:
        return "#ef4444";
    }
  };

const buildNodesAndEdges = (node, x = 0, y = 0, depth = 0, yOffset = { val: 0 }) => {
  let nodes = [];
  let edges = [];

  const NODE_WIDTH = 220;
  const NODE_HEIGHT = 60;
  const V_GAP = 30;
  const H_GAP = 280;

  const nodeId = `node-${depth}-${node.title.replace(/[^a-zA-Z0-9]/g, "-").substring(0, 20)}-${yOffset.val}`;

  const myY = yOffset.val;
  yOffset.val += NODE_HEIGHT + V_GAP;

  const childResults = [];
  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      const result = buildNodesAndEdges(child, x + H_GAP, 0, depth + 1, yOffset);
      childResults.push(result);
    });
  }

  let nodeY = myY;
  if (childResults.length > 0) {
    const firstChildY = childResults[0].nodes[0].position.y;
    const lastChildY = childResults[childResults.length - 1].nodes[0].position.y;
    nodeY = (firstChildY + lastChildY) / 2;
  }

  nodes.push({
    id: nodeId,
    position: { x, y: nodeY },
    data: {
      label: (
        <div className="text-center px-1">
          <p className="font-semibold text-[13px] leading-tight">{node.title}</p>
        </div>
      ),
      raw: node,
    },
    style: {
      background: depth === 0 ? "#12326b" : node.status === "green" ? "#f0fdf4" : node.status === "yellow" ? "#fefce8" : "#fff",
      color: depth === 0 ? "#fff" : "#1a1a1a",
      border: `2.5px solid ${getNodeColor(node.status || "red")}`,
      borderRadius: depth === 0 ? "20px" : "12px",
      padding: "10px 14px",
      width: NODE_WIDTH,
      minHeight: NODE_HEIGHT,
      fontSize: depth === 0 ? "15px" : "13px",
      fontWeight: depth === 0 ? "700" : "500",
      boxShadow: depth === 0
        ? "0 6px 20px rgba(18,50,107,0.25)"
        : "0 3px 10px rgba(0,0,0,0.07)",
      cursor: "pointer",
    },
  });

  childResults.forEach((result) => {
    const childNodeId = result.nodes[0].id;
    nodes = [...nodes, ...result.nodes];
    edges = [...edges, ...result.edges];
    edges.push({
      id: `e-${nodeId}-${childNodeId}`,
      source: nodeId,
      target: childNodeId,
      type: "smoothstep",
      animated: false,
      style: {
        stroke: depth === 0 ? "#12326b" : "#94a3b8",
        strokeWidth: depth === 0 ? 2.5 : 1.5,
        strokeDasharray: depth === 0 ? "0" : "5,4",
      },
    });
  });

  return { nodes, edges };
};

const countNodes = (node) => {
  if (!node.children || node.children.length === 0) return 1;
  return node.children.reduce((sum, child) => sum + countNodes(child), 0);
};

  const { nodes: flowNodes, edges: flowEdges } = useMemo(() => {
  const roadmapRoot = roadmapData?.roadmap;

  if (!roadmapRoot) return { nodes: [], edges: [] };

  return buildNodesAndEdges(roadmapRoot, 400, 80);
}, [roadmapData]);

  const findNodeById = (node, nodeId) => {
    const baseTitle = nodeId.split("-")[0];

    if (node.title === baseTitle) return node;

    if (node.children) {
      for (let child of node.children) {
        const found = findNodeById(child, nodeId);
        if (found) return found;
      }
    }

    return null;
  };

  const handleNodeClick = (_, node) => {
    if (node.data?.raw) {
      setSelectedStep(node.data.raw);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fc] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-500 font-medium">
            Generating your personalized roadmap...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] px-4 sm:px-6 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-6 transition"
        >
          <FaArrowLeft />
          Back to Search
        </button>

        {error ? (
          <div className="bg-white rounded-2xl shadow-md p-10 text-center">
            <h2 className="text-3xl font-bold text-red-500 mb-3">Oops!</h2>
            <p className="text-gray-600 text-lg">{error}</p>
          </div>
        ) : roadmapData ? (
          <>
            {/* Header */}
            <div className="bg-white rounded-3xl shadow-md p-8 mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-[#12326b] mb-3">
                {roadmapData.topic || decodeURIComponent(topic)} Roadmap
              </h1>

              <p className="text-gray-600 text-base sm:text-lg mb-4">
                {roadmapData.description ||
                  `A complete learning roadmap for ${decodeURIComponent(topic)}`}
              </p>

              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                  Level: {roadmapData.level || level}
                </span>
                <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                  Duration: {roadmapData.learningTime || duration}
                </span>
              </div>

              <div>
                <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                  <span>Your Progress</span>
                  <span>{progress}%</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* React Flow */}
              <div className="xl:col-span-2 bg-white rounded-3xl shadow-md p-4 h-[700px]">
                <h2 className="text-2xl font-bold text-[#12326b] mb-4 px-2">
                  Visual Learning Path
                </h2>

              <div className="w-full h-[620px] rounded-2xl overflow-hidden border border-gray-100">
                <ReactFlow
                  nodes={flowNodes}
                  edges={flowEdges}
                  fitView
                  onNodeClick={handleNodeClick}
                  fitViewOptions={{ padding: 0.15, maxZoom: 1.0 }}  // ← zoom out a bit
                  nodesDraggable={false}
                  nodesConnectable={false}
                  minZoom={0.3}   // ← allow zooming out more
                  maxZoom={1.5}
                >
                    <MiniMap />
                    <Controls />
                    <Background variant="dots" gap={20} size={1} />
                  </ReactFlow>
                </div>
              </div>

              {/* Step Details */}
              <div className="bg-white rounded-3xl shadow-md p-6 h-fit sticky top-6">
                <h2 className="text-2xl font-bold text-[#12326b] mb-4">
                  Step Details
                </h2>

                {selectedStep ? (
                  <>
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                      {selectedStep.step || selectedStep.title}
                    </h3>

                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-5 ${getStatusStyles(
                        selectedStep.status,
                      )}`}
                    >
                      Status: {selectedStep.status}
                    </span>

                    {/* Buttons */}
                    <div className="flex flex-col gap-3 mb-6">
                      <button
                        onClick={() =>
                          handleStatusChange(
                            selectedStep.step || selectedStep.title,
                            "red",
                          )
                        }
                        className="px-4 py-3 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 text-sm font-medium flex items-center justify-center gap-2 transition"
                      >
                        <FaTimesCircle />
                        Not Started
                      </button>

                      <button
                        onClick={() =>
                          handleStatusChange(
                            selectedStep.step || selectedStep.title,
                            "yellow",
                          )
                        }
                        className="px-4 py-3 rounded-xl bg-yellow-100 text-yellow-700 hover:bg-yellow-200 text-sm font-medium flex items-center justify-center gap-2 transition"
                      >
                        <FaClock />
                        In Progress
                      </button>

                      <button
                        onClick={() =>
                          handleStatusChange(
                            selectedStep.step || selectedStep.title,
                            "green",
                          )
                        }
                        className="px-4 py-3 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 text-sm font-medium flex items-center justify-center gap-2 transition"
                      >
                        <FaCheckCircle />
                        Completed
                      </button>
                    </div>

                    {/* Resources */}
                    {selectedStep.resources &&
                      selectedStep.resources.length > 0 && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-4">
                            Recommended Resources
                          </h4>

                          <div className="space-y-3">
                            {selectedStep.resources.map((resource, idx) => {
  const isCompleted = selectedStep.completedResources?.includes(resource.link);

  return (
    <div
      key={idx}
      className={`border rounded-xl p-4 transition ${
        isCompleted
          ? "bg-green-50 border-green-300"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      {/* Clickable link */}
      <a
        href={resource.link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 mb-3"
      >
        {resource.type === "video" ? (
          <FaYoutube className="text-red-500 text-xl" />
        ) : (
          <FaGlobe className="text-blue-500 text-lg" />
        )}
        <p className="text-gray-800 font-medium hover:underline">
          {resource.title}
        </p>
      </a>

      {/* Mark complete button */}
      <button
        onClick={() => handleResourceComplete(resource.link, !isCompleted)}
        className={`w-full py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition ${
          isCompleted
            ? "bg-green-200 text-green-800 hover:bg-green-300"
            : "bg-gray-200 text-gray-600 hover:bg-gray-300"
        }`}
      >
        <FaCheckCircle />
        {isCompleted ? "Completed ✓" : "Mark as Complete"}
      </button>
    </div>
  );
})}
                          </div>
                        </div>
                      )}
                  </>
                ) : (
                  <p className="text-gray-500">
                    Click on a roadmap node to view its details.
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-10 text-center">
            <h2 className="text-2xl font-bold text-gray-700 mb-3">
              No roadmap found
            </h2>
            <p className="text-gray-500">
              Try generating another roadmap from the dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Roadmap;
