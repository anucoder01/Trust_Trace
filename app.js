// Helper function for toast notifications
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.style.background = isError ? 'var(--accent-red)' : 'var(--surface-highlight)';
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Helper to simulate API delay
const delay = (ms) => new Promise(res => setTimeout(res, ms));

document.addEventListener('DOMContentLoaded', () => {

    /* --- HERO CANVAS ANIMATION --- */
    const heroCanvas = document.getElementById('heroCanvas');
    if (heroCanvas) {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: heroCanvas, alpha: true, antialias: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 1000;
        const posArray = new Float32Array(particlesCount * 3);
        
        for(let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 10;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        const material = new THREE.PointsMaterial({
            size: 0.02,
            color: 0x3b82f6,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        const particlesMesh = new THREE.Points(particlesGeometry, material);
        scene.add(particlesMesh);
        camera.position.z = 3;
        
        let mouseX = 0;
        let mouseY = 0;
        
        document.addEventListener('mousemove', (event) => {
            mouseX = event.clientX / window.innerWidth - 0.5;
            mouseY = event.clientY / window.innerHeight - 0.5;
        });
        
        const clock = new THREE.Clock();
        
        function animate() {
            requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();
            
            particlesMesh.rotation.y = elapsedTime * 0.05;
            particlesMesh.rotation.x = elapsedTime * 0.02;
            
            particlesMesh.position.x += (mouseX * 0.5 - particlesMesh.position.x) * 0.05;
            particlesMesh.position.y += (-mouseY * 0.5 - particlesMesh.position.y) * 0.05;
            
            renderer.render(scene, camera);
        }
        animate();
        
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    /* --- STATS COUNTER --- */
    const stats = document.querySelectorAll('.stat-num');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseFloat(entry.target.getAttribute('data-target'));
                const duration = 2000;
                const start = performance.now();
                const initial = 0;
                
                const updateCounter = (currentTime) => {
                    const elapsed = currentTime - start;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // easeOutQuart
                    const ease = 1 - Math.pow(1 - progress, 4);
                    const current = initial + (target - initial) * ease;
                    
                    if (target % 1 !== 0) {
                        entry.target.innerText = current.toFixed(1);
                    } else {
                        entry.target.innerText = Math.floor(current);
                    }
                    
                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        entry.target.innerText = target;
                    }
                };
                requestAnimationFrame(updateCounter);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    stats.forEach(stat => observer.observe(stat));

    /* --- MODULE 1: RISK ENGINE --- */
    const riskCalcBtn = document.getElementById('riskCalcBtn');
    if (riskCalcBtn) {
        riskCalcBtn.addEventListener('click', async () => {
            const btn = riskCalcBtn;
            btn.innerHTML = '🔄 Calculating Risk Matrix...';
            btn.disabled = true;
            
            // Hide output, show idle during "calculation"
            document.querySelector('.risk-idle').classList.add('hidden');
            const output = document.getElementById('riskOutput');
            output.classList.add('hidden');
            
            await delay(1200); // Simulate network/processing
            
            // Get inputs
            const amount = parseFloat(document.getElementById('txAmount').value) || 0;
            const cvScore = parseInt(document.getElementById('txCvScore').value) || 0;
            const location = document.getElementById('txLocation').value;
            const age = document.getElementById('txAge').value;
            const flags = parseInt(document.getElementById('txFlags').value) || 0;
            
            // Simple heuristic for demonstration
            let risk = (100 - cvScore) * 0.4;
            if (amount > 100000) risk += 15;
            if (amount > 500000) risk += 10;
            if (location === 'international') risk += 20;
            if (location === 'domestic') risk += 10;
            if (age === 'new') risk += 15;
            if (flags > 0) risk += 20;
            
            risk = Math.min(Math.max(Math.round(risk), 0), 100);
            
            // Update UI
            document.getElementById('gaugeVal').textContent = `${risk}%`;
            const gaugePath = document.getElementById('gaugePath');
            // length is 251, offset 251 means 0%. offset 0 means 100%
            const offset = 251 - (risk / 100) * 251;
            gaugePath.style.strokeDashoffset = offset;
            
            let color, verdictClass, verdictText;
            if (risk < 30) {
                color = '#10b981'; // Green
                verdictClass = 'low';
                verdictText = '✅ LOW RISK (Approve)';
            } else if (risk < 70) {
                color = '#f59e0b'; // Orange
                verdictClass = 'med';
                verdictText = '⚠️ MEDIUM RISK (Review)';
            } else {
                color = '#ef4444'; // Red
                verdictClass = 'high';
                verdictText = '🚫 HIGH RISK (Decline)';
            }
            gaugePath.setAttribute('stroke', color);
            document.getElementById('gaugeVal').style.color = color;
            
            const verdictEl = document.getElementById('riskVerdict');
            verdictEl.className = `risk-verdict ${verdictClass}`;
            verdictEl.textContent = verdictText;
            
            const factorsEl = document.getElementById('riskFactors');
            factorsEl.innerHTML = `
                <div class="factor-item"><span>Visual Authenticity:</span> <strong>${cvScore}% match</strong></div>
                <div class="factor-item"><span>Amount Anomaly:</span> <strong>${amount > 100000 ? 'High' : 'Normal'}</strong></div>
                <div class="factor-item"><span>Location Risk:</span> <strong>${location.toUpperCase()}</strong></div>
                <div class="factor-item"><span>Account Age:</span> <strong>${age.toUpperCase()}</strong></div>
            `;
            
            output.classList.remove('hidden');
            btn.innerHTML = '🌐 Calculate Risk Score';
            btn.disabled = false;
        });
    }

    /* --- CANVAS DRAWING HELPER --- */
    class SignaturePad {
        constructor(canvasId, onChangeCallback) {
            this.canvas = document.getElementById(canvasId);
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');
            this.isDrawing = false;
            this.hasContent = false;
            this.onChange = onChangeCallback;
            this.strokes = []; // Store raw points for temporal analysis
            this.currentStroke = [];
            
            // Resize canvas to match display size for correct coordinate mapping
            this.resize();
            window.addEventListener('resize', () => this.resize());
            
            // Setup events
            this.canvas.addEventListener('mousedown', this.start.bind(this));
            this.canvas.addEventListener('mousemove', this.draw.bind(this));
            this.canvas.addEventListener('mouseup', this.stop.bind(this));
            this.canvas.addEventListener('mouseout', this.stop.bind(this));
            
            // Touch support
            this.canvas.addEventListener('touchstart', (e) => { e.preventDefault(); this.start(e.touches[0]); });
            this.canvas.addEventListener('touchmove', (e) => { e.preventDefault(); this.draw(e.touches[0]); });
            this.canvas.addEventListener('touchend', (e) => { e.preventDefault(); this.stop(); });
            
            // Initial styling
            this.ctx.lineWidth = 2.5;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.strokeStyle = '#000';
        }
        
        resize() {
            const rect = this.canvas.parentElement.getBoundingClientRect();
            this.canvas.width = rect.width;
            // keep height as defined in CSS
        }
        
        start(e) {
            this.isDrawing = true;
            this.hasContent = true;
            const pos = this.getPos(e);
            this.ctx.beginPath();
            this.ctx.moveTo(pos.x, pos.y);
            this.currentStroke = [{x: pos.x, y: pos.y, time: Date.now()}];
            if(this.onChange) this.onChange(true);
        }
        
        draw(e) {
            if (!this.isDrawing) return;
            const pos = this.getPos(e);
            this.ctx.lineTo(pos.x, pos.y);
            this.ctx.stroke();
            this.currentStroke.push({x: pos.x, y: pos.y, time: Date.now()});
        }
        
        stop() {
            if (this.isDrawing) {
                this.isDrawing = false;
                if(this.currentStroke.length > 0) {
                    this.strokes.push(this.currentStroke);
                }
            }
        }
        
        getPos(e) {
            const rect = this.canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
        
        clear() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.hasContent = false;
            this.strokes = [];
            if(this.onChange) this.onChange(false);
        }
    }

    /* --- MODULE 2: TREMOR DETECTION --- */
    const tremorPad = new SignaturePad('tremorCanvas', (hasContent) => {
        document.getElementById('tremorAnalyse').disabled = !hasContent;
    });
    
    document.getElementById('tremorClear')?.addEventListener('click', () => {
        tremorPad.clear();
        document.querySelector('.tremor-idle').classList.remove('hidden');
        document.getElementById('tremorOutput').classList.add('hidden');
    });
    
    document.getElementById('tremorAnalyse')?.addEventListener('click', async (e) => {
        const btn = e.target;
        btn.innerHTML = '🔄 Analysing Image...';
        btn.disabled = true;
        
        document.querySelector('.tremor-idle').classList.add('hidden');
        const output = document.getElementById('tremorOutput');
        output.classList.add('hidden');
        
        await delay(1500); // Simulate CV processing
        
        // Mock analysis results based on draw speed (simple heuristic)
        // If they drew fast, less tremor. If slow, more tremor.
        let totalTime = 0;
        let points = 0;
        tremorPad.strokes.forEach(stroke => {
            if(stroke.length > 1) {
                totalTime += stroke[stroke.length-1].time - stroke[0].time;
                points += stroke.length;
            }
        });
        
        const avgTimePerPoint = points > 0 ? totalTime / points : 0;
        const isSlow = avgTimePerPoint > 15; // Arbitrary threshold
        
        const tremorScore = isSlow ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 20) + 5;
        const blotting = isSlow ? Math.floor(Math.random() * 5) + 3 : Math.floor(Math.random() * 2);
        
        output.innerHTML = `
            <div class="panel-header">🔬 CV Analysis Results</div>
            <div class="to-stat">
                <div><strong>High-Frequency Jitter</strong><br/><small style="color:var(--text-secondary)">Deviation from smooth B-spline</small></div>
                <div class="to-val ${tremorScore < 40 ? 'safe' : ''}">${tremorScore}%</div>
            </div>
            <div class="to-stat">
                <div><strong>Ink Blotting Points</strong><br/><small style="color:var(--text-secondary)">Detected hesitation regions</small></div>
                <div class="to-val ${blotting < 3 ? 'safe' : ''}">${blotting} pts</div>
            </div>
            <div class="to-stat">
                <div><strong>Stroke Continuity</strong><br/><small style="color:var(--text-secondary)">Unnatural pen lifts</small></div>
                <div class="to-val ${!isSlow ? 'safe' : ''}">${isSlow ? 'Abnormal' : 'Natural'}</div>
            </div>
            <p style="margin-top:1rem; font-size:0.9rem; color:var(--text-secondary);">
                ${isSlow ? '⚠️ High tremor detected. This signature shows signs of slow tracing or imitation, lacking the ballistic fluidity of genuine handwriting.' : '✅ Signature strokes are fluid and ballistic. No significant hesitation artifacts detected.'}
            </p>
        `;
        
        output.classList.remove('hidden');
        btn.innerHTML = '🔬 Detect Tremors';
        btn.disabled = false;
    });

    /* --- MODULE 3: STYLUS TRACKING --- */
    const stylusPad = new SignaturePad('stylusCanvas', (hasContent) => {
        document.getElementById('stylusAnalyse').disabled = !hasContent;
        if(hasContent) {
            document.querySelector('.tv-idle').textContent = 'Recording sequence...';
        } else {
            document.querySelector('.tv-idle').textContent = 'Sign above to see your biometric timeline';
        }
    });
    
    document.getElementById('stylusClear')?.addEventListener('click', () => {
        stylusPad.clear();
        document.getElementById('smVel').style.width = '0%';
        document.getElementById('smPres').style.width = '0%';
        document.getElementById('smSeq').style.width = '0%';
        document.getElementById('smLift').style.width = '0%';
        document.getElementById('lstmVerdict').classList.add('hidden');
    });
    
    document.getElementById('stylusAnalyse')?.addEventListener('click', async (e) => {
        const btn = e.target;
        btn.innerHTML = '🧠 Processing LSTM...';
        btn.disabled = true;
        
        document.querySelector('.tv-idle').textContent = 'Extracting temporal features...';
        
        await delay(1000); // Simulate LSTM forward pass
        
        document.querySelector('.tv-idle').textContent = 'Comparing to baseline model...';
        
        await delay(800);
        
        // Animate metrics
        document.getElementById('smVel').style.width = '88%';
        document.getElementById('smPres').style.width = '92%';
        document.getElementById('smSeq').style.width = '100%';
        document.getElementById('smLift').style.width = '85%';
        
        const verdict = document.getElementById('lstmVerdict');
        verdict.textContent = '✅ Biometric Rhythm Match: 91% (Genuine)';
        verdict.className = 'lstm-verdict'; // Reset classes
        verdict.classList.remove('hidden');
        
        document.querySelector('.tv-idle').textContent = 'Temporal Analysis Complete';
        btn.innerHTML = '🧠 Analyse Rhythm';
        btn.disabled = false;
    });

    /* --- MODULE 4: ADAPTIVE LEARNING --- */
    let registeredProfiles = 0;
    
    // Setup 3 small pads
    for(let i=1; i<=3; i++) {
        const slotCanvas = document.getElementById(`slotCanvas${i}`);
        if(!slotCanvas) continue;
        
        // Make it interactive but simple
        let isDraw = false;
        const ctx = slotCanvas.getContext('2d');
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#000';
        
        slotCanvas.addEventListener('mousedown', (e) => { isDraw=true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); });
        slotCanvas.addEventListener('mousemove', (e) => { if(isDraw) { ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); }});
        slotCanvas.addEventListener('mouseup', () => isDraw=false);
        slotCanvas.addEventListener('mouseout', () => isDraw=false);
        
        const btn = document.getElementById(`slotBtn${i}`);
        btn.addEventListener('click', () => {
            btn.textContent = '✅ Saved';
            btn.style.background = 'var(--accent-green)';
            btn.style.color = '#fff';
            btn.disabled = true;
            slotCanvas.style.pointerEvents = 'none'; // Lock drawing
            registeredProfiles++;
            showToast(`Reference ${i} added to centroid.`);
        });
    }
    
    const adaptivePad = new SignaturePad('adaptiveTestCanvas', (hasContent) => {
        document.getElementById('adaptiveTest').disabled = !hasContent;
    });
    
    document.getElementById('adaptiveClear')?.addEventListener('click', () => {
        adaptivePad.clear();
        document.querySelector('.ar-idle').classList.remove('hidden');
        document.getElementById('arOutput').classList.add('hidden');
    });
    
    document.getElementById('adaptiveTest')?.addEventListener('click', async (e) => {
        if(registeredProfiles === 0) {
            showToast('Please register at least one reference signature first!', true);
            return;
        }
        
        const btn = e.target;
        btn.innerHTML = '🧬 Testing...';
        btn.disabled = true;
        
        document.querySelector('.ar-idle').classList.add('hidden');
        const output = document.getElementById('arOutput');
        output.classList.add('hidden');
        
        await delay(1200);
        
        const isMatch = Math.random() > 0.3; // 70% chance of pass for demo
        
        output.innerHTML = `
            <div style="text-align:center">
                <div style="font-size:3rem; margin-bottom:1rem;">${isMatch ? '✅' : '❌'}</div>
                <h3 style="margin-bottom:1rem;">${isMatch ? 'Match Found' : 'Drift Too High'}</h3>
                <p style="color:var(--text-secondary); font-size:0.9rem;">
                    ${isMatch 
                        ? `Distance to profile centroid is within acceptable threshold. The model has updated its parameters to include this new sample, adapting to the user's natural handwriting drift.` 
                        : `Signature deviates significantly from the registered profiles. Distance in latent space exceeds the few-shot boundary.`}
                </p>
            </div>
        `;
        
        output.classList.remove('hidden');
        btn.innerHTML = '🧬 Test Signature';
        btn.disabled = false;
    });
    
    // Draw dummy chart
    const driftChartCanvas = document.getElementById('driftChart');
    if(driftChartCanvas) {
        const ctx = driftChartCanvas.getContext('2d');
        // Simple mock line chart
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(10, 100);
        ctx.lineTo(50, 95);
        ctx.lineTo(100, 110);
        ctx.lineTo(150, 80);
        ctx.lineTo(200, 85);
        ctx.lineTo(250, 60);
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.lineTo(250, 160);
        ctx.lineTo(10, 160);
        ctx.fill();
        
        ctx.fillStyle = '#9ca3af';
        ctx.font = '10px Inter';
        ctx.fillText('Acceptable Drift Boundary', 10, 20);
    }


    /* --- MODULE 5: TELLER DASHBOARD --- */
    const tellerUploadBtn = document.getElementById('tellerUploadBtn');
    const tellerFile = document.getElementById('tellerFile');
    const tellerUploadZone = document.getElementById('tellerUpload');
    const tellerPreview = document.getElementById('tellerPreview');
    
    tellerUploadBtn?.addEventListener('click', () => {
        tellerFile.click();
    });
    
    tellerFile?.addEventListener('change', (e) => {
        if(e.target.files.length > 0) {
            // Simulate upload
            tellerUploadZone.classList.add('hidden');
            tellerPreview.classList.remove('hidden');
            showToast('Cheque scanned successfully.');
            // Adjust canvas size for the mock cheque
            tellerPad.resize();
        }
    });
    
    const tellerPad = new SignaturePad('tellerSigCanvas', (hasContent) => {
        document.getElementById('tellerVerify').disabled = !hasContent;
    });
    
    document.getElementById('tellerClear')?.addEventListener('click', () => {
        tellerPad.clear();
        document.getElementById('tellerResultPanel').querySelector('.teller-idle').classList.remove('hidden');
        document.getElementById('tellerOutput').classList.add('hidden');
        document.getElementById('heatmapOverlay').classList.add('hidden');
        document.getElementById('heatmapOverlay').style.backgroundImage = 'none';
    });
    
    document.getElementById('tellerVerify')?.addEventListener('click', async (e) => {
        const btn = e.target;
        btn.innerHTML = '🔍 Analysing...';
        btn.disabled = true;
        
        const idle = document.getElementById('tellerResultPanel').querySelector('.teller-idle');
        idle.classList.add('hidden');
        const output = document.getElementById('tellerOutput');
        output.classList.add('hidden');
        
        try {
            // Get the signature image as a Blob
            const blob = await new Promise(resolve => tellerPad.canvas.toBlob(resolve, 'image/png'));
            
            const formData = new FormData();
            formData.append('file', blob, 'signature.png');
            
            const startTime = performance.now();
            const response = await fetch('http://localhost:8000/api/v1/verify', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            const endTime = performance.now();
            const processTime = Math.round(endTime - startTime);
            
            if (data.status === 'success') {
                const isFraud = data.verdict === 'Suspicious';
                const confidence = data.confidence_score;
                
                document.getElementById('tcMatch').textContent = isFraud ? `${(100 - confidence).toFixed(1)}%` : `${confidence.toFixed(1)}%`;
                document.getElementById('tcMatch').style.color = isFraud ? 'var(--accent-red)' : 'var(--accent-green)';
                
                document.getElementById('tcFraud').textContent = isFraud ? `${confidence.toFixed(1)}%` : `${(100 - confidence).toFixed(1)}%`;
                document.getElementById('tcFraud').style.color = isFraud ? 'var(--accent-red)' : 'var(--accent-green)';
                
                document.getElementById('tcRisk').textContent = isFraud ? 'HIGH' : 'LOW';
                document.getElementById('tcRisk').style.color = isFraud ? 'var(--accent-red)' : 'var(--accent-green)';
                
                const tvbIcon = document.getElementById('tvbIcon');
                const tvbMain = document.getElementById('tvbMain');
                const tvbSub = document.getElementById('tvbSub');
                const tvbTime = document.getElementById('tvbTime');
                const bar = document.getElementById('tellerVerdictBar');
                
                if (isFraud) {
                    tvbIcon.textContent = '🚫';
                    tvbMain.textContent = 'Signature Forgery Detected';
                    tvbMain.style.color = 'var(--accent-red)';
                    tvbSub.textContent = `High confidence (${confidence}%) of structural imitation.`;
                    bar.style.borderColor = 'var(--accent-red)';
                    bar.style.background = 'rgba(239, 68, 68, 0.05)';
                } else {
                    tvbIcon.textContent = '✅';
                    tvbMain.textContent = 'Signature Verified';
                    tvbMain.style.color = 'var(--accent-green)';
                    tvbSub.textContent = `Matches reference profile perfectly (${confidence}%).`;
                    bar.style.borderColor = 'var(--accent-green)';
                    bar.style.background = 'rgba(16, 185, 129, 0.05)';
                }
                
                // Always show real heatmap from backend
                const overlay = document.getElementById('heatmapOverlay');
                overlay.classList.remove('hidden');
                overlay.style.backgroundImage = `url('${data.heatmap_image_base64}')`;
                overlay.style.backgroundSize = 'cover';
                overlay.style.backgroundPosition = 'center';
                overlay.style.mixBlendMode = 'multiply';
                
                document.getElementById('tellerFlags').innerHTML = `
                    <div style="font-size:0.85rem; padding:1rem; background:var(--bg-color); border-radius:8px; margin-bottom:1rem;">
                        <strong>ML & Tremor Alerts:</strong><br/>
                        • Edge Jitter Ratio: ${data.tremor_analysis.edge_jitter_ratio}<br/>
                        • Ink Blot Ratio: ${data.tremor_analysis.ink_blot_ratio}<br/>
                        • Tremor Risk Score: ${data.tremor_analysis.tremor_risk_score}<br/>
                        • Heatmap highlights region of highest divergence.
                    </div>
                `;
                
                tvbTime.innerHTML = `Process Time:<br/><strong>${processTime}ms</strong>`;
                output.classList.remove('hidden');
            } else {
                showToast('API Error: ' + data.message, true);
                idle.classList.remove('hidden');
            }
        } catch (error) {
            console.error('API Error:', error);
            showToast('Failed to connect to backend ML service.', true);
            idle.classList.remove('hidden');
        } finally {
            btn.innerHTML = '🔍 Verify Cheque';
            btn.disabled = false;
        }
    });

    // Teller actions
    document.getElementById('tellerApprove')?.addEventListener('click', () => {
        showToast('Transaction Approved.');
        document.getElementById('tellerClear').click();
    });
    
    document.getElementById('tellerReject')?.addEventListener('click', () => {
        showToast('Transaction Rejected and Flagged for Review.', true);
        document.getElementById('tellerClear').click();
    });

    document.getElementById('tellerEscalate')?.addEventListener('click', () => {
        showToast('Transaction Escalated to Senior Manager for Manual Review.', true);
        document.getElementById('tellerClear').click();
    });

});
