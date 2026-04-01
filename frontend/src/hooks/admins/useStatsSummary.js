
import { useState, useEffect } from "react";
import axiosInstance from "../../instances/Axiosinstances";

const useStatsSummary = (email) => {
    const [statsSummary, setStatSummary] = useState([])
    const [statsLoader, setStatsLoader] = useState(false)

    const getStatsSummary = async() => {

        try{
            setStatsLoader(true)
            const response = await axiosInstance.get(`/blog/analytics/view/summary/${email}`);

            if (response.status === 200) {
                setStatSummary(response.data.summary)  
            }
        }
        catch(err){
            console.log("error", err.message)
        }
        finally{
            setStatsLoader(false);
        }
    }

    useEffect(()=>{
        getStatsSummary();
    }, [])

    return {statsSummary, statsLoader, getStatsSummary}

}

export default useStatsSummary;