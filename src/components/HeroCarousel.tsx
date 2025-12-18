'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface CarouselImage {
    id: string;
    url: string;
    title?: string;
    link?: string;
}

interface HeroCarouselProps {
    images?: CarouselImage[];
}

// Default placeholder images for when admin hasn't set any
const defaultImages: CarouselImage[] = [
    {
        id: '1',
        url: '/placeholder-banner-1.jpg',
        title: 'Welcome to TDP',
    },
];

export default function HeroCarousel({ images = defaultImages }: HeroCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const displayImages = images.length > 0 ? images : defaultImages;

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % displayImages.length);
    }, [displayImages.length]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
    }, [displayImages.length]);

    // Auto-advance slides
    useEffect(() => {
        if (displayImages.length <= 1) return;
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [displayImages.length, nextSlide]);

    return (
        <section className="hero-carousel">
            <div className="hero-carousel-container">
                {displayImages.map((image, index) => (
                    <div
                        key={image.id}
                        className={`hero-carousel-slide ${index === currentIndex ? 'active' : ''}`}
                    >
                        <div className="hero-carousel-image">
                            {image.url.startsWith('/placeholder') ? (
                                <div className="hero-carousel-placeholder">
                                    <h1 className="hero-title">TDP - Telugu Desam Party</h1>
                                    <p className="hero-subtitle">Ground Activity • Digital Visibility • Measurable Impact</p>
                                </div>
                            ) : (
                                <Image
                                    src={image.url}
                                    alt={image.title || 'Banner'}
                                    fill
                                    priority={index === 0}
                                    style={{ objectFit: 'cover' }}
                                />
                            )}
                        </div>
                        {image.title && !image.url.startsWith('/placeholder') && (
                            <div className="hero-carousel-caption">
                                <h2>{image.title}</h2>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {displayImages.length > 1 && (
                <>
                    <button className="hero-carousel-arrow prev" onClick={prevSlide} aria-label="Previous slide">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                    <button className="hero-carousel-arrow next" onClick={nextSlide} aria-label="Next slide">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                    <div className="hero-carousel-dots">
                        {displayImages.map((_, index) => (
                            <button
                                key={index}
                                className={`hero-carousel-dot ${index === currentIndex ? 'active' : ''}`}
                                onClick={() => setCurrentIndex(index)}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
