import React, { useState } from 'react'
import { Input } from './ui/input'
import { useNavigate, useParams } from 'react-router-dom'
import { RouteSearch } from '@/helpers/RouteName'

const SearchBox = () => {
    const navigate = useNavigate()
    const { countryCode } = useParams()
    const [query, setQuery] = useState('')
    
    const handleInput = (e) => {
        setQuery(e.target.value)
    }
    
    const handleSubmit = (e) => {
        e.preventDefault()
        if (query.trim()) {
            navigate(`/${countryCode}/escort/list?q=${encodeURIComponent(query.trim())}`)
        }
    }
    
    return (
        <form onSubmit={handleSubmit}>
            <Input 
                name="q" 
                value={query}
                onChange={handleInput} 
                placeholder="Search escorts..." 
                className="h-9 rounded-full bg-gray-50" 
            />
        </form>
    )
}

export default SearchBox