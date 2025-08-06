/**
 * AspectRatio Component Stories
 * Showcasing different ratios, media examples, and responsive behavior
 * WCAG AAA compliant examples with Norwegian text
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import {
  AspectRatio,
  ResponsiveAspectRatio,
  MediaAspectRatio,
  PlaceholderAspectRatio,
  AspectRatioPresets,
  calculateAspectRatio,
  getDimensionsFromRatio,
  getCommonRatios,
} from '../registry/components/aspect-ratio/aspect-ratio';

const meta: Meta<typeof AspectRatio> = {
  title: 'Layout/AspectRatio',
  component: AspectRatio,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Aspect ratio component for maintaining consistent proportions across different screen sizes and content types.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    ratio: {
      control: 'select',
      options: ['square', 'video', '4/3', '3/2', '16/10', '21/9', '1/2', '2/3', '3/4', '9/16', 'portrait', 'landscape', 'ultrawide', 'golden'],
      description: 'Predefined aspect ratio',
    },
    customRatio: {
      control: 'number',
      description: 'Custom aspect ratio (width/height)',
    },
    rounded: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'],
      description: 'Border radius',
    },
    border: {
      control: 'select',
      options: ['none', 'thin', 'medium', 'thick', 'accent'],
      description: 'Border style',
    },
    shadow: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl'],
      description: 'Shadow depth',
    },
    maintainObjectFit: {
      control: 'select',
      options: [undefined, 'contain', 'cover', 'fill', 'none', 'scale-down'],
      description: 'Object fit for images/videos',
    },
  },
} satisfies Meta<typeof AspectRatio>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default AspectRatio
export const Default: Story = {
  render: () => {
    return (
      <div className="w-64">
        <AspectRatio ratio="square" rounded="lg" border="thin" shadow="md">
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-400 to-blue-600 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold">1:1</div>
              <div className="text-sm opacity-90">Kvadratisk format</div>
            </div>
          </div>
        </AspectRatio>
      </div>
    );
  },
};

// Common Ratio Presets
export const CommonRatios: Story = {
  render: () => {
    const ratios = [
      { key: 'square', label: '1:1 Kvadrat', description: 'Perfekt for profiler og ikoner' },
      { key: 'video', label: '16:9 Video', description: 'Standard videoformat' },
      { key: '4/3', label: '4:3 Klassisk', description: 'Tradisjonelt TV-format' },
      { key: '3/2', label: '3:2 Foto', description: 'Klassisk fotoformat' },
      { key: 'portrait', label: '3:4 Portrett', description: 'Vertikal orientering' },
      { key: 'golden', label: '1.618:1 Gyllne snitt', description: 'Estetisk pleasing proporsjoner' },
    ] as const;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
        {ratios.map(({ key, label, description }) => (
          <div key={key} className="space-y-3">
            <div className="w-full">
              <AspectRatio ratio={key} rounded="lg" border="thin" shadow="sm">
                <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 text-white p-4">
                  <div className="text-lg font-bold text-center">{label}</div>
                  <div className="text-xs opacity-90 text-center mt-1">{description}</div>
                </div>
              </AspectRatio>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">{label}</p>
              <p className="text-xs text-gray-500">{description}</p>
            </div>
          </div>
        ))}
      </div>
    );
  },
};

// Custom Ratios
export const CustomRatios: Story = {
  render: () => {
    const customRatios = [
      { ratio: 2.5, label: '2.5:1 Panorama', color: 'from-green-400 to-blue-500' },
      { ratio: 1.4, label: '1.4:1 Klassisk', color: 'from-purple-400 to-pink-500' },
      { ratio: 0.8, label: '0.8:1 Høy', color: 'from-yellow-400 to-red-500' },
      { ratio: 0.6, label: '0.6:1 Mobil', color: 'from-blue-400 to-indigo-600' },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {customRatios.map(({ ratio, label, color }) => (
          <div key={ratio} className="space-y-3">
            <div className="w-full">
              <AspectRatio customRatio={ratio} rounded="lg" border="thin" shadow="md">
                <div className={`flex items-center justify-center h-full bg-gradient-to-br ${color} text-white`}>
                  <div className="text-center">
                    <div className="text-xl font-bold">{label}</div>
                    <div className="text-sm opacity-90">Ratio: {ratio}</div>
                  </div>
                </div>
              </AspectRatio>
            </div>
            <p className="text-sm text-center text-gray-600">Tilpasset ratio: {ratio}:1</p>
          </div>
        ))}
      </div>
    );
  },
};

// Image Examples
export const ImageExamples: Story = {
  render: () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
        <div className="space-y-4">
          <h3 className="text-base font-medium text-gray-900">Bilder med object-fit</h3>
          
          <div className="space-y-4">
            {['cover', 'contain', 'fill'].map((fit) => (
              <div key={fit} className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Object-fit: {fit}</p>
                <AspectRatio 
                  ratio="video" 
                  rounded="lg" 
                  border="thin" 
                  shadow="sm"
                  maintainObjectFit={fit as any}
                >
                  <img
                    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                    alt="Norsk landskap"
                  />
                </AspectRatio>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-base font-medium text-gray-900">Forskjellige formater</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Kvadratisk portrett</p>
              <AspectRatio ratio="square" rounded="full" border="medium" shadow="lg">
                <img
                  src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="Portrettbilde"
                  className="object-cover"
                />
              </AspectRatio>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Landskap 3:2</p>
              <AspectRatio ratio="3/2" rounded="xl" border="thin" shadow="md">
                <img
                  src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                  alt="Norsk natur"
                  className="object-cover"
                />
              </AspectRatio>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// Media Aspect Ratio Examples
export const MediaAspectRatioExamples: Story = {
  render: () => {
    const [imageLoaded, setImageLoaded] = useState(false);
    
    return (
      <div className="space-y-8 max-w-4xl">
        <h3 className="text-lg font-medium text-gray-900">MediaAspectRatio komponenter</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-base font-medium text-gray-700">Bilde med loading state</h4>
            
            <MediaAspectRatio
              src="https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
              alt="Teknologi og innovasjon"
              type="image"
              ratio="video"
              rounded="lg"
              border="thin"
              shadow="md"
              loading="lazy"
              placeholder={
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              }
              fallback={
                <div className="flex items-center justify-center bg-gray-100 text-gray-500">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                    </svg>
                    <p className="text-sm">Bilde ikke tilgjengelig</p>
                  </div>
                </div>
              }
              onLoad={() => setImageLoaded(true)}
              onError={(error) => console.log('Image load error:', error)}
            />
            
            <p className="text-xs text-gray-500">
              Status: {imageLoaded ? 'Lastet' : 'Laster...'}
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-base font-medium text-gray-700">Video eksempel</h4>
            
            <MediaAspectRatio
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              type="video"
              ratio="video"
              rounded="lg"
              border="thin"
              shadow="md"
              controls={true}
              muted={true}
              poster="https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
              placeholder={
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-2 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    <p className="text-sm text-gray-500">Laster video...</p>
                  </div>
                </div>
              }
              fallback={
                <div className="flex items-center justify-center bg-gray-100 text-gray-500">
                  <p className="text-sm">Video ikke tilgjengelig</p>
                </div>
              }
            />
            
            <p className="text-xs text-gray-500">
              Video med poster og fallback
            </p>
          </div>
        </div>
      </div>
    );
  },
};

// Responsive Aspect Ratio
export const ResponsiveExample: Story = {
  render: () => {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Responsiv AspectRatio</h3>
          <p className="text-sm text-gray-600 mt-1">
            Endre vindusbredde for å se hvordan aspect ratio tilpasser seg
          </p>
        </div>
        
        <div className="space-y-8">
          <div className="w-full">
            <ResponsiveAspectRatio
              ratios={{
                sm: 'square',    // Mobile: 1:1
                md: '4/3',       // Tablet: 4:3
                lg: 'video',     // Desktop: 16:9
                xl: 'ultrawide', // Large: 21:9
              }}
              rounded="lg"
              border="thin"
              shadow="md"
            >
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white">
                <div className="text-center p-4">
                  <div className="text-2xl font-bold mb-2">Responsiv Layout</div>
                  <div className="text-sm opacity-90">
                    <div className="block sm:hidden">📱 Mobil: 1:1 (Kvadrat)</div>
                    <div className="hidden sm:block md:hidden">📟 Tablet: 4:3 (Klassisk)</div>
                    <div className="hidden md:block lg:hidden">💻 Desktop: 16:9 (Video)</div>
                    <div className="hidden lg:block">🖥️ Stor skjerm: 21:9 (Ultrawide)</div>
                  </div>
                </div>
              </div>
            </ResponsiveAspectRatio>
          </div>
          
          <div className="grid grid-cols-4 gap-2 text-xs text-center">
            <div className="p-2 bg-blue-50 rounded">
              <div className="font-medium">Mobil</div>
              <div className="text-gray-600">&lt; 768px</div>
              <div className="text-blue-600">1:1</div>
            </div>
            <div className="p-2 bg-green-50 rounded">
              <div className="font-medium">Tablet</div>
              <div className="text-gray-600">768px+</div>
              <div className="text-green-600">4:3</div>
            </div>
            <div className="p-2 bg-purple-50 rounded">
              <div className="font-medium">Desktop</div>
              <div className="text-gray-600">1024px+</div>
              <div className="text-purple-600">16:9</div>
            </div>
            <div className="p-2 bg-pink-50 rounded">
              <div className="font-medium">Stor</div>
              <div className="text-gray-600">1280px+</div>
              <div className="text-pink-600">21:9</div>
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// Placeholder Examples
export const PlaceholderExamples: Story = {
  render: () => {
    const placeholders = [
      {
        ratio: 'square' as const,
        text: 'Brukerprofil',
        backgroundColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        icon: (
          <svg className="h-8 w-8 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        ),
      },
      {
        ratio: 'video' as const,
        text: 'Video thumbnail',
        backgroundColor: 'bg-gray-100',
        textColor: 'text-gray-600',
        icon: (
          <svg className="h-10 w-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        ),
      },
      {
        ratio: '4/3' as const,
        text: 'Produktbilde',
        backgroundColor: 'bg-green-100',
        textColor: 'text-green-800',
        icon: (
          <svg className="h-10 w-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
      },
    ];

    return (
      <div className="space-y-6 max-w-4xl">
        <h3 className="text-lg font-medium text-gray-900">Placeholder komponenter</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {placeholders.map(({ ratio, text, backgroundColor, textColor, icon }, index) => (
            <div key={index} className="space-y-3">
              <PlaceholderAspectRatio
                ratio={ratio}
                text={text}
                backgroundColor={backgroundColor}
                textColor={textColor}
                icon={icon}
                rounded="lg"
                border="thin"
                shadow="sm"
              />
              <p className="text-sm text-center text-gray-600">{text}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-8">
          <h4 className="text-base font-medium text-gray-900 mb-4">Interaktiv placeholder</h4>
          <div className="max-w-md">
            <PlaceholderAspectRatio
              ratio="video"
              text="Klikk for å laste opp bilde"
              backgroundColor="bg-gray-50"
              textColor="text-gray-500"
              rounded="lg"
              border="thin"
              shadow="sm"
              className="cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <button className="absolute inset-0 w-full h-full flex flex-col items-center justify-center hover:bg-black hover:bg-opacity-5 transition-colors">
                <svg className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm text-gray-600 font-medium">Last opp bilde</span>
                <span className="text-xs text-gray-500 mt-1">PNG, JPG opptil 10MB</span>
              </button>
            </PlaceholderAspectRatio>
          </div>
        </div>
      </div>
    );
  },
};

// Utility Functions Demo
export const UtilityFunctionsDemo: Story = {
  render: () => {
    const [width, setWidth] = useState(400);
    const [height, setHeight] = useState(300);
    
    const calculatedRatio = calculateAspectRatio(width, height);
    const dimensionsFromRatio = getDimensionsFromRatio(calculatedRatio, 320);
    const commonRatios = getCommonRatios();
    
    return (
      <div className="space-y-8 max-w-4xl">
        <h3 className="text-lg font-medium text-gray-900">Utility Functions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-base font-medium text-gray-700">Ratio kalkulator</h4>
            
            <div className="p-4 bg-gray-50 rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bredde
                  </label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Høyde
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <p><strong>Beregnet ratio:</strong> {calculatedRatio.toFixed(3)}</p>
                <p><strong>Dimensjoner ved 320px bredde:</strong> {dimensionsFromRatio.width}×{dimensionsFromRatio.height.toFixed(0)}px</p>
              </div>
            </div>
            
            <div className="w-full">
              <AspectRatio customRatio={calculatedRatio} rounded="lg" border="thin" shadow="sm">
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                  <div className="text-center">
                    <div className="text-lg font-bold">{width}×{height}</div>
                    <div className="text-sm opacity-90">Ratio: {calculatedRatio.toFixed(3)}</div>
                  </div>
                </div>
              </AspectRatio>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-base font-medium text-gray-700">Vanlige ratios</h4>
            
            <div className="space-y-2">
              {Object.entries(commonRatios).map(([name, ratio]) => (
                <div key={name} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{name}</span>
                  <span className="text-sm text-gray-600">{ratio.toFixed(3)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
};

// Preset Components
export const PresetComponents: Story = {
  render: () => {
    return (
      <div className="space-y-6 max-w-4xl">
        <h3 className="text-lg font-medium text-gray-900">Forhåndsdefinerte komponenter</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Square</h4>
            <AspectRatioPresets.Square rounded="lg" shadow="md">
              <div className="flex items-center justify-center h-full bg-red-400 text-white">
                <div className="text-center">
                  <div className="text-lg font-bold">1:1</div>
                  <div className="text-xs">Kvadrat</div>
                </div>
              </div>
            </AspectRatioPresets.Square>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Video</h4>
            <AspectRatioPresets.Video rounded="lg" shadow="md">
              <div className="flex items-center justify-center h-full bg-blue-400 text-white">
                <div className="text-center">
                  <div className="text-lg font-bold">16:9</div>
                  <div className="text-xs">Video</div>
                </div>
              </div>
            </AspectRatioPresets.Video>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Golden</h4>
            <AspectRatioPresets.Golden rounded="lg" shadow="md">
              <div className="flex items-center justify-center h-full bg-yellow-400 text-white">
                <div className="text-center">
                  <div className="text-lg font-bold">φ:1</div>
                  <div className="text-xs">Gyllne snitt</div>
                </div>
              </div>
            </AspectRatioPresets.Golden>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Portrait</h4>
            <AspectRatioPresets.Portrait rounded="lg" shadow="md">
              <div className="flex items-center justify-center h-full bg-green-400 text-white">
                <div className="text-center">
                  <div className="text-lg font-bold">3:4</div>
                  <div className="text-xs">Portrett</div>
                </div>
              </div>
            </AspectRatioPresets.Portrait>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Landscape</h4>
            <AspectRatioPresets.Landscape rounded="lg" shadow="md">
              <div className="flex items-center justify-center h-full bg-purple-400 text-white">
                <div className="text-center">
                  <div className="text-lg font-bold">4:3</div>
                  <div className="text-xs">Landskap</div>
                </div>
              </div>
            </AspectRatioPresets.Landscape>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Ultrawide</h4>
            <AspectRatioPresets.Ultrawide rounded="lg" shadow="md">
              <div className="flex items-center justify-center h-full bg-indigo-400 text-white">
                <div className="text-center">
                  <div className="text-lg font-bold">21:9</div>
                  <div className="text-xs">Ultrawide</div>
                </div>
              </div>
            </AspectRatioPresets.Ultrawide>
          </div>
        </div>
      </div>
    );
  },
};

// Interactive Playground
export const Playground: Story = {
  render: (args) => {
    return (
      <div className="w-80">
        <AspectRatio
          ratio={args.ratio}
          customRatio={args.customRatio}
          rounded={args.rounded}
          border={args.border}
          shadow={args.shadow}
          maintainObjectFit={args.maintainObjectFit}
        >
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-400 to-purple-500 text-white">
            <div className="text-center p-4">
              <div className="text-lg font-bold mb-2">Interaktiv AspectRatio</div>
              <div className="text-sm opacity-90">
                {args.customRatio ? 
                  `Tilpasset: ${args.customRatio}:1` : 
                  `Forhåndsatt: ${args.ratio || 'square'}`
                }
              </div>
              <div className="text-xs opacity-75 mt-2">
                Bruk Storybook controls for å justere
              </div>
            </div>
          </div>
        </AspectRatio>
      </div>
    );
  },
  args: {
    ratio: 'square',
    customRatio: undefined,
    rounded: 'lg',
    border: 'thin',
    shadow: 'md',
    maintainObjectFit: undefined,
  },
};