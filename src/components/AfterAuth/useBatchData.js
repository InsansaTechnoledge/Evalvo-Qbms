import { use, useEffect, useState } from "react";
import { useUser } from "../../contexts/UserContext"
import { fetchBatchList } from "../../services/batchService";
import { getSchool } from "../../services/schoolService";
import { fetchProgramList } from "../../services/programService";

export const useBatchData = () => {
    const {user} = useUser();
    const [schools, setSchools] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [batchData, setBatchData] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const fetchBatches = async () => {
        setLoading(true);
        try{
            const batchData = await fetchBatchList();
            setBatches(batchData.data);
        }catch(e){
            console.error("Error fetching batches:", e);
            console.log(e.response);
        }finally{
            setLoading(false);
        }
    }
const fetchschoolAndProgramData = async () => {
    try {
        setLoading(true);
        const programPromises = batches.map(b =>
            fetchProgramList({
                id: b.course_id,
                organization_id:
                    user.role === "organization" ? user._id : user.organization_id._id
            })
        );

        const schoolPromises = batches.map(b =>
            getSchool({
                id: b.program_id,
                organization_id:
                    user.role === "organization" ? user._id : user.organization_id._id
            })
        );

        const programResults = await Promise.all(programPromises);
        const schoolResults = await Promise.all(schoolPromises);

        setPrograms(programResults.flatMap(r => r.data));
        setSchools(schoolResults.flatMap(r => r.data));
    } catch (e) {
        console.error("Error fetching schools:", e);
    }
    finally {
        setLoading(false);
    }
};

useEffect(() => {
    fetchBatches();
}, []);

useEffect(() => {
    if (batches.length > 0) {
        fetchschoolAndProgramData();
    }
}, [batches]);


    const makeDataReady = () => {
        
        return batches.map(b => {
            const program = programs.find(p => p._id === b.program_id) || {};
            const school = schools.find(s => s._id === program.organization_id) || {};
            return {
                ...b,
                programName : program.name || 'N/A',
                schoolName : school.name || 'N/A'
            }
        });
    }
    useEffect(() => {
        if(batches.length > 0 && programs.length > 0 && schools.length > 0) {
            setLoading(true);
            const data = makeDataReady();
            setBatchData(data);
            setLoading(false);
        }
    }, [batches, programs, schools]);

    return {batchData, loading ,setBatches,setLoading};

}