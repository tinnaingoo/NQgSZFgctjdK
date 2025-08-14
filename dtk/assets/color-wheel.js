document.addEventListener('DOMContentLoaded', function() {
            const canvas = document.getElementById('color-wheel');
            const ctx = canvas.getContext('2d');
            const colorMarker = document.getElementById('color-marker');
            const colorPalette = document.getElementById('color-palette');
            const hexInput = document.getElementById('hex-value');
            const rgbInput = document.getElementById('rgb-value');
            const hslInput = document.getElementById('hsl-value');
            const colorPreview = document.getElementById('color-preview');
            const schemeButtons = document.querySelectorAll('.color-scheme-selector button');
            const theoryIndicator = document.getElementById('theory-indicator');
            const wheelContainer = document.querySelector('.color-wheel-container');
            
            let selectedScheme = 'analogous';
            let baseHue = 0;
            let baseSaturation = 1;
            let baseLightness = 0.5;
            let baseColor = { r: 255, g: 0, b: 0 };
            let theoryLines = [];
            
            // Draw color wheel
            function drawColorWheel() {
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const radius = Math.min(centerX, centerY) - 10;
                
                // Clear canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Draw color wheel
                for (let angle = 0; angle < 360; angle += 1) {
                    const startAngle = (angle - 2) * Math.PI / 180;
                    const endAngle = angle * Math.PI / 180;
                    
                    for (let r = 0; r < radius; r += 1) {
                        const saturation = r / radius;
                        const value = 1.0;
                        
                        const hue = angle;
                        const [red, green, blue] = hsvToRgb(hue, saturation, value);
                        
                        ctx.beginPath();
                        ctx.moveTo(centerX, centerY);
                        ctx.arc(centerX, centerY, r, startAngle, endAngle);
                        ctx.closePath();
                        
                        ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
                        ctx.fill();
                    }
                }
            }
            
            // HSV to RGB conversion
            function hsvToRgb(h, s, v) {
                h /= 60;
                const i = Math.floor(h);
                const f = h - i;
                const p = v * (1 - s);
                const q = v * (1 - s * f);
                const t = v * (1 - s * (1 - f));
                
                let r, g, b;
                switch (i % 6) {
                    case 0: r = v; g = t; b = p; break;
                    case 1: r = q; g = v; b = p; break;
                    case 2: r = p; g = v; b = t; break;
                    case 3: r = p; g = q; b = v; break;
                    case 4: r = t; g = p; b = v; break;
                    case 5: r = v; g = p; b = q; break;
                }
                
                return [
                    Math.round(r * 255),
                    Math.round(g * 255),
                    Math.round(b * 255)
                ];
            }
            
            // RGB to HEX conversion
            function rgbToHex(r, g, b) {
                return '#' + [r, g, b].map(x => {
                    const hex = x.toString(16);
                    return hex.length === 1 ? '0' + hex : hex;
                }).join('');
            }
            
            // RGB to HSL conversion
            function rgbToHsl(r, g, b) {
                r /= 255, g /= 255, b /= 255;
                const max = Math.max(r, g, b), min = Math.min(r, g, b);
                let h, s, l = (max + min) / 2;
                
                if (max === min) {
                    h = s = 0;
                } else {
                    const d = max - min;
                    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                    switch (max) {
                        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                        case g: h = (b - r) / d + 2; break;
                        case b: h = (r - g) / d + 4; break;
                    }
                    h /= 6;
                }
                
                return [
                    Math.round(h * 360),
                    Math.round(s * 100),
                    Math.round(l * 100)
                ];
            }
            
            // HSL to RGB conversion
            function hslToRgb(h, s, l) {
                h /= 360;
                s /= 100;
                l /= 100;
                
                let r, g, b;
                
                if (s === 0) {
                    r = g = b = l;
                } else {
                    const hue2rgb = (p, q, t) => {
                        if (t < 0) t += 1;
                        if (t > 1) t -= 1;
                        if (t < 1/6) return p + (q - p) * 6 * t;
                        if (t < 1/2) return q;
                        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                        return p;
                    };
                    
                    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                    const p = 2 * l - q;
                    
                    r = hue2rgb(p, q, h + 1/3);
                    g = hue2rgb(p, q, h);
                    b = hue2rgb(p, q, h - 1/3);
                }
                
                return [
                    Math.round(r * 255),
                    Math.round(g * 255),
                    Math.round(b * 255)
                ];
            }
            
            // HEX to RGB conversion
            function hexToRgb(hex) {
                hex = hex.replace(/^#/, '');
                
                if (hex.length === 3) {
                    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
                }
                
                const num = parseInt(hex, 16);
                return {
                    r: (num >> 16) & 255,
                    g: (num >> 8) & 255,
                    b: num & 255
                };
            }
            
            // Parse RGB string
            function parseRgb(rgbStr) {
                const match = rgbStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/i);
                if (!match) return null;
                
                return {
                    r: parseInt(match[1], 10),
                    g: parseInt(match[2], 10),
                    b: parseInt(match[3], 10)
                };
            }
            
            // Parse HSL string
            function parseHsl(hslStr) {
                const match = hslStr.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/i);
                if (!match) return null;
                
                return {
                    h: parseInt(match[1], 10),
                    s: parseInt(match[2], 10),
                    l: parseInt(match[3], 10)
                };
            }
            
            // Get color from wheel position
            function getColorFromWheel(x, y) {
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const radius = Math.min(centerX, centerY) - 10;
                
                if (distance > radius) return null;
                
                let angle = Math.atan2(dy, dx) * 180 / Math.PI;
                if (angle < 0) angle += 360;
                
                const saturation = distance / radius;
                const value = 1.0;
                
                return {
                    hsv: { h: angle, s: saturation, v: value },
                    rgb: hsvToRgb(angle, saturation, value)
                };
            }
            
            // Update base color from RGB values
            function updateBaseColor(r, g, b) {
                baseColor = { r, g, b };
                const hsl = rgbToHsl(r, g, b);
                baseHue = hsl[0];
                baseSaturation = hsl[1] / 100;
                baseLightness = hsl[2] / 100;
                
                updateMarkerPosition();
                updateColorValues(r, g, b);
                updateColorScheme();
                drawTheoryLines();
            }
            
            // Update marker position based on current color
            function updateMarkerPosition() {
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const radius = Math.min(centerX, centerY) - 10;
                
                const angle = baseHue * Math.PI / 180;
                const distance = baseSaturation * radius;
                const markerX = centerX + Math.cos(angle) * distance;
                const markerY = centerY + Math.sin(angle) * distance;
                
                colorMarker.style.left = `${markerX}px`;
                colorMarker.style.top = `${markerY}px`;
                colorMarker.style.backgroundColor = `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`;
            }
            
            // Draw theory lines on the color wheel
            function drawTheoryLines() {
                // Remove existing lines
                theoryLines.forEach(line => line.remove());
                theoryLines = [];
                
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const radius = Math.min(centerX, centerY) - 10;
                
                // Get angles for current scheme
                const angles = getAnglesForScheme(selectedScheme, baseHue);
                
                angles.forEach(angle => {
                    const line = document.createElement('div');
                    line.className = 'theory-line';
                    
                    const angleRad = angle * Math.PI / 180;
                    const endX = centerX + Math.cos(angleRad) * radius;
                    const endY = centerY + Math.sin(angleRad) * radius;
                    
                    const length = Math.sqrt(Math.pow(endX - centerX, 2) + Math.pow(endY - centerY, 2));
                    const transformAngle = Math.atan2(endY - centerY, endX - centerX) * 180 / Math.PI;
                    
                    line.style.width = `${length}px`;
                    line.style.left = `${centerX}px`;
                    line.style.top = `${centerY}px`;
                    line.style.transform = `rotate(${transformAngle}deg)`;
                    
                    wheelContainer.appendChild(line);
                    theoryLines.push(line);
                });
            }
            
            // Get angles for current color scheme
            function getAnglesForScheme(scheme, baseAngle) {
                switch (scheme) {
                    case 'analogous':
                        return [
                            baseAngle,
                            (baseAngle + 30) % 360,
                            (baseAngle - 30 + 360) % 360
                        ];
                        
                    case 'monochromatic':
                        return [baseAngle];
                        
                    case 'triad':
                        return [
                            baseAngle,
                            (baseAngle + 120) % 360,
                            (baseAngle + 240) % 360
                        ];
                        
                    case 'complementary':
                        return [
                            baseAngle,
                            (baseAngle + 180) % 360
                        ];
                        
                    case 'split-complementary':
                        return [
                            baseAngle,
                            (baseAngle + 150) % 360,
                            (baseAngle + 210) % 360
                        ];
                        
                    case 'square':
                        return [
                            baseAngle,
                            (baseAngle + 90) % 360,
                            (baseAngle + 180) % 360,
                            (baseAngle + 270) % 360
                        ];
                        
                    case 'compound':
                        return [
                            baseAngle,
                            (baseAngle + 30) % 360,
                            (baseAngle + 180) % 360,
                            (baseAngle + 210) % 360
                        ];
                        
                    default:
                        return [baseAngle];
                }
            }
            
            // Update color scheme
            function updateColorScheme() {
                const colors = [];
                theoryIndicator.textContent = selectedScheme.charAt(0).toUpperCase() + selectedScheme.slice(1);
                
                switch (selectedScheme) {
                    case 'analogous':
                        colors.push(baseHue);
                        colors.push((baseHue + 30) % 360);
                        colors.push((baseHue - 30 + 360) % 360);
                        colors.push((baseHue + 15) % 360);
                        colors.push((baseHue - 15 + 360) % 360);
                        break;
                        
                    case 'monochromatic':
                        // Different lightness levels
                        colors.push(baseHue);
                        colors.push(baseHue);
                        colors.push(baseHue);
                        colors.push(baseHue);
                        colors.push(baseHue);
                        break;
                        
                    case 'triad':
                        colors.push(baseHue);
                        colors.push((baseHue + 120) % 360);
                        colors.push((baseHue + 240) % 360);
                        colors.push((baseHue + 60) % 360);
                        colors.push((baseHue + 180) % 360);
                        break;
                        
                    case 'complementary':
                        colors.push(baseHue);
                        colors.push((baseHue + 180) % 360);
                        colors.push((baseHue + 90) % 360);
                        colors.push((baseHue + 270) % 360);
                        colors.push((baseHue + 45) % 360);
                        break;
                        
                    case 'split-complementary':
                        colors.push(baseHue);
                        colors.push((baseHue + 150) % 360);
                        colors.push((baseHue + 210) % 360);
                        colors.push((baseHue + 30) % 360);
                        colors.push((baseHue + 330) % 360);
                        break;
                        
                    case 'square':
                        colors.push(baseHue);
                        colors.push((baseHue + 90) % 360);
                        colors.push((baseHue + 180) % 360);
                        colors.push((baseHue + 270) % 360);
                        colors.push((baseHue + 45) % 360);
                        break;
                        
                    case 'compound':
                        colors.push(baseHue);
                        colors.push((baseHue + 30) % 360);
                        colors.push((baseHue + 180) % 360);
                        colors.push((baseHue + 210) % 360);
                        colors.push((baseHue + 60) % 360);
                        break;
                }
                
                const colorBoxes = colorPalette.querySelectorAll('.color-box');
                colorBoxes.forEach((box, index) => {
                    if (index < colors.length) {
                        let r, g, b;
                        
                        if (selectedScheme === 'monochromatic') {
                            // For monochromatic, vary lightness
                            const lightness = 0.2 + (index * 0.15);
                            [r, g, b] = hslToRgb(baseHue, baseSaturation * 100, lightness * 100);
                        } else {
                            // For other schemes, use full saturation
                            [r, g, b] = hsvToRgb(colors[index], 1, 1);
                        }
                        
                        const hex = rgbToHex(r, g, b);
                        box.style.backgroundColor = hex;
                        box.querySelector('.hex-value').textContent = hex;
                        
                        // Update text color for better contrast
                        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                        box.style.color = luminance > 0.5 ? 'black' : 'white';
                        box.style.textShadow = luminance > 0.5 ? '0 0 3px rgba(255,255,255,0.8)' : '0 0 3px rgba(0,0,0,0.5)';
                        
                        // Store RGB values on the element
                        box.dataset.r = r;
                        box.dataset.g = g;
                        box.dataset.b = b;
                    }
                });
            }
            
            // Update color values
            function updateColorValues(r, g, b) {
                const hex = rgbToHex(r, g, b);
                const hsl = rgbToHsl(r, g, b);
                
                hexInput.value = hex;
                rgbInput.value = `rgb(${r}, ${g}, ${b})`;
                hslInput.value = `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
                colorPreview.style.backgroundColor = hex;
            }
            
            // Handle wheel click
            canvas.addEventListener('click', function(e) {
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const color = getColorFromWheel(x, y);
                if (color) {
                    updateBaseColor(color.rgb[0], color.rgb[1], color.rgb[2]);
                }
            });
            
            // Handle scheme selection
            schemeButtons.forEach(button => {
                button.addEventListener('click', function() {
                    schemeButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    selectedScheme = this.dataset.scheme;
                    updateColorScheme();
                    drawTheoryLines();
                });
            });
            
            // Handle palette color click
            colorPalette.addEventListener('click', function(e) {
                const colorBox = e.target.closest('.color-box');
                if (colorBox) {
                    const r = parseInt(colorBox.dataset.r);
                    const g = parseInt(colorBox.dataset.g);
                    const b = parseInt(colorBox.dataset.b);
                    updateBaseColor(r, g, b);
                }
            });
            
            // Handle HEX input change
            hexInput.addEventListener('change', function() {
                const hex = this.value;
                if (/^#?([0-9A-F]{3}){1,2}$/i.test(hex)) {
                    const rgb = hexToRgb(hex);
                    updateBaseColor(rgb.r, rgb.g, rgb.b);
                } else {
                    this.value = rgbToHex(baseColor.r, baseColor.g, baseColor.b);
                }
            });
            
            // Handle RGB input change
            rgbInput.addEventListener('change', function() {
                const rgb = parseRgb(this.value);
                if (rgb) {
                    updateBaseColor(rgb.r, rgb.g, rgb.b);
                } else {
                    this.value = `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`;
                }
            });
            
            // Handle HSL input change
            hslInput.addEventListener('change', function() {
                const hsl = parseHsl(this.value);
                if (hsl) {
                    const [r, g, b] = hslToRgb(hsl.h, hsl.s, hsl.l);
                    updateBaseColor(r, g, b);
                } else {
                    const hsl = rgbToHsl(baseColor.r, baseColor.g, baseColor.b);
                    this.value = `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`;
                }
            });
            
            // Handle color preview click (copy to clipboard)
            colorPreview.addEventListener('click', function() {
                const hex = rgbToHex(baseColor.r, baseColor.g, baseColor.b);
                navigator.clipboard.writeText(hex).then(() => {
                    const originalColor = this.style.backgroundColor;
                    this.style.backgroundColor = '#4CAF50';
                    setTimeout(() => {
                        this.style.backgroundColor = originalColor;
                    }, 300);
                });
            });
            
            // Initialize
            drawColorWheel();
            updateBaseColor(baseColor.r, baseColor.g, baseColor.b);
        });