
import { useState, useEffect } from "react";
import axiosInstance from "../instances/Axiosinstances";

const useGetAllAuthorsByDomain = (domain) => {

    const [coordinators, setCoordinators] = useState([]);
    const [loading, setLoading] = useState(false);
     const decodedCategory = decodeURIComponent(domain);
    const fetchCoordinators = async () => {
            setLoading(true);
            console.log("decodedCategory", decodedCategory);
        try{

            const response  = await axiosInstance.get(`/blog/author/getAllAuthorsByDomain/${decodedCategory}`);
                console.log("response", response.data);
            if (response.status === 200){
                setCoordinators(response.data.filteredAuthors);
            }

        }
        catch(err){
            console.log("error", err.message);
        }
        finally{
            setLoading(false);
        }
    }

    useEffect(()=>{
        fetchCoordinators()
    }, [domain]);

    return {coordinators, loading};
}

export default useGetAllAuthorsByDomain;
