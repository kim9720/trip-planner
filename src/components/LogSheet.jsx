import React, { useEffect, useRef } from 'react';

const LogSheet = ({ logs }) => {
  const canvasRefs = useRef([]);

  useEffect(() => {
    logs.forEach((log, index) => {
      const canvas = canvasRefs.current[index];
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Status colors and positions
        const statusConfig = {
          'Off-Duty': { color: '#c3ddf8ff', y: 120 },
          'On-Duty': { color: '#ffd166', y: 80 },
          'Driving': { color: '#06d6a0', y: 40 },
          'Sleeper Berth': { color: '#118ab2', y: 160 }
        };

        // Draw status blocks
        let prevTime = new Date(log.status_log[0][0]);
        let prevStatus = log.status_log[0][1];
        
        log.status_log.slice(1).forEach(([time, status]) => {
          const currentTime = new Date(time);
          const startHour = prevTime.getHours() + prevTime.getMinutes() / 60;
          const endHour = currentTime.getHours() + currentTime.getMinutes() / 60;
          const width = (endHour - startHour) * 25;
          
          if (width > 0 && statusConfig[prevStatus]) {
            const { color, y } = statusConfig[prevStatus];
            
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.roundRect(startHour * 25 + 40, y - 15, width, 30, 4);
            ctx.fill();
          }
          
          prevTime = currentTime;
          prevStatus = status;
        });

        // Draw grid lines (starting after labels)
        ctx.strokeStyle = '#dee2e6';
        ctx.lineWidth = 1;
        for (let x = 0; x <= 24; x++) {
          ctx.beginPath();
          ctx.moveTo(x * 25 + 40, 30);
          ctx.lineTo(x * 25 + 40, 180);
          ctx.stroke();
          
          // Hour labels
          if (x % 2 === 0) { // Show only even hours to reduce clutter
            ctx.fillStyle = '#6c757d';
            ctx.font = '10px "Inter", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${x}`, x * 25 + 40 + 12.5, 20);
          }
        }

        // Draw status labels on the left
        ctx.textAlign = 'right'; // Right-align to keep consistent spacing
        ctx.font = 'bold 11px "Inter", sans-serif';
        
        Object.entries(statusConfig).forEach(([status, { y }]) => {
          ctx.fillStyle = '#495057';
          ctx.fillText(status.toUpperCase(), 35, y + 5);
        });

        // Draw break table
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#dee2e6';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(490, 30, 150, 80, 6);
        ctx.fill();
        ctx.stroke();

        // Table header
        ctx.fillStyle = '#4e73df';
        ctx.font = 'bold 12px "Inter", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('BREAKS', 565, 50);

        // Table content
        ctx.fillStyle = '#495057';
        ctx.font = '11px "Inter", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Break 1', 500, 70);
        ctx.fillText('11:00:00', 500, 90);
        ctx.fillText('Break 2', 570, 70);
        ctx.fillText('03:00:00', 570, 90);
      }
    });
  }, [logs]);

  return (
    <div className="mt-4" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {logs.map((log, index) => (
        <div key={index} className="mb-5" style={{ 
          background: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          padding: '20px',
          border: '1px solid #e9ecef'
        }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 style={{ 
              color: '#2c3e50',
              fontWeight: '600',
              fontSize: '1.1rem',
              margin: 0
            }}>
              {log.date}
            </h3>
            <div style={{ 
              background: '#f8f9fa',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '0.8rem',
              color: '#495057'
            }}>
              {log.driving_hours}h driving
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <canvas
              ref={(el) => (canvasRefs.current[index] = el)}
              width={650}
              height={200}
              style={{ 
                width: '100%',
                height: 'auto',
                maxWidth: '650px'
              }}
            />
          </div>

          <div className="d-flex justify-content-between mt-4" style={{ fontSize: '0.8rem' }}>
            <div>
              <span style={{ color: '#6c757d' }}>On-Duty:</span> {log.on_duty_hours}h
            </div>
            <div>
              <span style={{ color: '#6c757d' }}>Fuel Stops:</span> {log.fueling_stops}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LogSheet;