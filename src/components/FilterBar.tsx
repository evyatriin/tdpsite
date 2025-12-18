'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { State, District, Constituency } from '@/types';

interface FilterBarProps {
    onFilterChange: (filters: {
        state?: string;
        district?: string;
        constituency?: string;
        category?: string;
    }) => void;
}

export default function FilterBar({ onFilterChange }: FilterBarProps) {
    const t = useTranslations('common');
    const tEvents = useTranslations('events');

    const [states, setStates] = useState<State[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [constituencies, setConstituencies] = useState<Constituency[]>([]);

    const [selectedState, setSelectedState] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedConstituency, setSelectedConstituency] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const categories = [
        { value: 'OUTREACH', label: tEvents('categories.OUTREACH') },
        { value: 'WELFARE', label: tEvents('categories.WELFARE') },
        { value: 'MEETING', label: tEvents('categories.MEETING') },
        { value: 'PROTEST', label: tEvents('categories.PROTEST') },
        { value: 'SOCIAL_SERVICE', label: tEvents('categories.SOCIAL_SERVICE') },
    ];

    // Fetch states on mount
    useEffect(() => {
        fetch('/api/locations/states')
            .then((res) => res.json())
            .then((data) => setStates(data.items || []))
            .catch(console.error);
    }, []);

    // Fetch districts when state changes
    useEffect(() => {
        if (selectedState) {
            fetch(`/api/locations/districts?stateId=${selectedState}`)
                .then((res) => res.json())
                .then((data) => setDistricts(data.items || []))
                .catch(console.error);
        } else {
            setDistricts([]);
        }
        setSelectedDistrict('');
        setSelectedConstituency('');
        setConstituencies([]);
    }, [selectedState]);

    // Fetch constituencies when district changes
    useEffect(() => {
        if (selectedDistrict) {
            fetch(`/api/locations/constituencies?districtId=${selectedDistrict}`)
                .then((res) => res.json())
                .then((data) => setConstituencies(data.items || []))
                .catch(console.error);
        } else {
            setConstituencies([]);
        }
        setSelectedConstituency('');
    }, [selectedDistrict]);

    // Notify parent of filter changes
    useEffect(() => {
        onFilterChange({
            state: selectedState || undefined,
            district: selectedDistrict || undefined,
            constituency: selectedConstituency || undefined,
            category: selectedCategory || undefined,
        });
    }, [selectedState, selectedDistrict, selectedConstituency, selectedCategory, onFilterChange]);

    return (
        <div className="filter-bar">
            <div className="filter-bar-container">
                <select
                    className="filter-select"
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                >
                    <option value="">{t('allStates')}</option>
                    {states.map((state) => (
                        <option key={state.id} value={state.id}>
                            {state.name}
                        </option>
                    ))}
                </select>

                <select
                    className="filter-select"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={!selectedState}
                >
                    <option value="">{t('allDistricts')}</option>
                    {districts.map((district) => (
                        <option key={district.id} value={district.id}>
                            {district.name}
                        </option>
                    ))}
                </select>

                <select
                    className="filter-select"
                    value={selectedConstituency}
                    onChange={(e) => setSelectedConstituency(e.target.value)}
                    disabled={!selectedDistrict}
                >
                    <option value="">{t('allConstituencies')}</option>
                    {constituencies.map((constituency) => (
                        <option key={constituency.id} value={constituency.id}>
                            {constituency.name}
                        </option>
                    ))}
                </select>

                <select
                    className="filter-select"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="">{t('allCategories')}</option>
                    {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                            {cat.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
