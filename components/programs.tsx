
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db, rtdb } from "@/utils/firebase";
import { onValue, ref } from "firebase/database";
import { getAuth, onAuthStateChanged  } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";


interface ProgramsListProps {
  onProgramSelect: (programId: string) => void;
  moduleProgress: Record<string, number>;
  programProgress : any
}

export function ProgramsList({
  onProgramSelect,
  moduleProgress,
  programProgress
}: ProgramsListProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userProgramProgress, setUserProgramProgress] = useState<any>({});

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    getDoc(userRef).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserProgramProgress(data.programProgress || {});
      }
    });
  }, []);



const calculateModuleProgress = (module: any, completedVideos: Record<string, boolean> = {}) => {
  const videoIds = Object.keys(module?.videos ?? {});
  const totalVideos = videoIds.length;
  const completedCount = videoIds.filter(videoId => completedVideos?.[videoId] ?? false).length;

  return totalVideos === 0 ? 0 : Math.round((completedCount / totalVideos) * 100);
};





  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // 1️⃣ Fetch all programs from RTDB
      const coursesRef = ref(rtdb, "courses/thrivemed/programs");
      onValue(coursesRef, async (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          setPrograms([]);
          setLoading(false);
          return;
        }

        const programsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));

        // 2️⃣ Fetch current user's assigned programs from Firestore
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          setPrograms([]);
          setLoading(false);
          return;
        }

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const userAssignedPrograms = userSnap.exists()
          ? userSnap.data().assignedPrograms || {}
          : {};

        // 3️⃣ Merge default and user-assigned programs
        const assignedProgramIds = new Set(
        Object.entries(userAssignedPrograms)
          .filter(([_, assigned]) => assigned)
          .map(([program]) => program)
      );


      // 4️⃣ Filter programs to only assigned ones
      const assignedPrograms = programsArray.filter((p) =>
        assignedProgramIds.has(p.id)
    );

        setPrograms(assignedPrograms);
        setLoading(false);
      });
    };

    fetchData();
  }, []);



  // const programs = [
  //   {
  //     id: "thrivemed-hub",
  //     name: "Thrivemed Hub",
  //     status: "active",
  //     description: "Personalized Health Roadmaps",
  //     progress: calculateOverallProgress(),
  //   },
  //   {
  //     id: "thrivemed-apollo",
  //     name: "Thrivemed Apollo",
  //     status: "completed",
  //     description: "Advanced Health Optimization",
  //     progress: 100,
  //   },
  // ];

  const filteredPrograms = programs.filter((program) => {
    if (activeTab === "all") return true;
    return program.status === activeTab;
  });

  return (
    <>
    {programs.length === 0 && (
      <div className="text-center relative top-48 py-12">
        <p className="text-gray-500">No assigned programs.</p>
      </div>
    )}

    <div className="min-h-screen ">
      <div className="py-8 px-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          My Programs & Courses
        </h1>

        <Tabs
          defaultValue="all"
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none mb-6 p-0">
            <TabsTrigger
              value="all"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:bg-white data-[state=active]:border-blue-500 data-[state=active]:text-blue-600  bg-transparent px-4 py-2"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:bg-white data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 bg-transparent px-4 py-2"
            >
              Active
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="rounded-none data-[state=active]:border-b-2 data-[state=active]:bg-white data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 bg-transparent px-4 py-2"
            >
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {filteredPrograms.length > 0 ? (
              <div className="space-y-6">
                {activeTab === "all" && (
                  <>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Active Programs
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {programs
                        .filter((p) => p.status === "active")
                        .map((program) => 
                        {
                          const progress = userProgramProgress[program.id] || 0;

                          return (
                          <Card
                            key={program.id}
                            className="overflow-hidden rounded-xl shadow-sm border-0 hover:shadow-md transition-shadow text-gray-900"
                          >
                            <div className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="text-lg font-semibold">
                                    {program.name}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    {program.description}
                                  </p>
                                </div>
                                <div className="relative h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                                  <div className="absolute inset-0">
                                    <svg
                                      viewBox="0 0 100 100"
                                      className="h-full w-full"
                                    >
                                      <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        stroke="#e6e6e6"
                                        strokeWidth="10"
                                        fill="none"
                                      />
                                      <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        stroke="#3b82f6"
                                        strokeWidth="10"
                                        fill="none"
                                        strokeDasharray={`${
                                          progress * 2.51
                                        } 251`}
                                        strokeDashoffset="0"
                                        transform="rotate(-90 50 50)"
                                      />
                                    </svg>
                                  </div>
                                  <span className="text-xs font-medium">
                                    {progress}%
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-gray-500 text-sm">
                                  <Clock className="h-4 w-4" />
                                  <span>Started</span>
                                </div>
                                <Button
                                  onClick={() => onProgramSelect(program.id)}
                                  className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm"
                                >
                                  View
                                </Button>
                              </div>
                            </div>
                          </Card>
                        )})

                        }
                    </div>

                    <h2 className="text-xl font-semibold mt-8 text-gray-900">
                      Completed Programs
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {programs
                        .filter((p) => p.status === "completed")
                        .map((program) => {
                        const progress = userProgramProgress[program.id] || 0;

                          return (
                          <Card
                            key={program.id}
                            className="overflow-hidden rounded-xl shadow-sm border-0 hover:shadow-md transition-shadow text-gray-900"
                          >
                            <div className="p-6">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h3 className="text-lg font-semibold">
                                    {program.name}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    {program.description}
                                  </p>
                                </div>
                                <div className="relative h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                                  <div className="absolute inset-0">
                                    <svg
                                      viewBox="0 0 100 100"
                                      className="h-full w-full"
                                    >
                                      <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        stroke="#e6e6e6"
                                        strokeWidth="10"
                                        fill="none"
                                      />
                                      <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        stroke="#10b981"
                                        strokeWidth="10"
                                        fill="none"
                                        strokeDasharray="251 251"
                                        strokeDashoffset="0"
                                        transform="rotate(-90 50 50)"
                                      />
                                    </svg>
                                  </div>
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-green-500 text-sm">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>Completed</span>
                                </div>
                                <Button
                                  onClick={() => onProgramSelect(program.id)}
                                  className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm"
                                >
                                  View
                                </Button>
                              </div>
                            </div>
                          </Card>
                        
                        )})}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                {/* <p className="text-gray-500">No programs found</p> */}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="mt-0">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Active Programs
            </h2>
            {filteredPrograms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrograms.map((program) => {
               const progress = userProgramProgress[program.id] || 0;

                return (
                  <Card
                    key={program.id}
                    className="overflow-hidden rounded-xl shadow-sm border-0 hover:shadow-md transition-shadow text-gray-900"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {program.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {program.description}
                          </p>
                        </div>
                        <div className="relative h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <div className="absolute inset-0">
                            <svg
                              viewBox="0 0 100 100"
                              className="h-full w-full"
                            >
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="#e6e6e6"
                                strokeWidth="10"
                                fill="none"
                              />
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="#3b82f6"
                                strokeWidth="10"
                                fill="none"
                                strokeDasharray={`${
                                  progress * 2.51
                                } 251`}
                                strokeDashoffset="0"
                                transform="rotate(-90 50 50)"
                              />
                            </svg>
                          </div>
                          <span className="text-xs font-medium">
                            {progress}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          <Clock className="h-4 w-4" />
                          <span>Started</span>
                        </div>
                        <Button
                          onClick={() => onProgramSelect(program.id)}
                          className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm"
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </Card>
                )})}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No active programs found</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Completed Programs
            </h2>
            {filteredPrograms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrograms.map((program) => (
                  <Card
                    key={program.id}
                    className="overflow-hidden rounded-xl shadow-sm border-0 hover:shadow-md transition-shadow text-gray-900"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {program.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {program.description}
                          </p>
                        </div>
                        <div className="relative h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <div className="absolute inset-0">
                            <svg
                              viewBox="0 0 100 100"
                              className="h-full w-full"
                            >
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="#e6e6e6"
                                strokeWidth="10"
                                fill="none"
                              />
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                stroke="#10b981"
                                strokeWidth="10"
                                fill="none"
                                strokeDasharray="251 251"
                                strokeDashoffset="0"
                                transform="rotate(-90 50 50)"
                              />
                            </svg>
                          </div>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-green-500 text-sm">
                          <CheckCircle className="h-4 w-4" />
                          <span>Completed</span>
                        </div>
                        <Button
                          onClick={() => onProgramSelect(program.id)}
                          className="rounded-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm"
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No completed programs found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
}
