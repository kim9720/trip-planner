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
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = '#e9ecef';
        ctx.lineWidth = 1;
        for (let x = 0; x <= 24; x++) {
          ctx.beginPath();
          ctx.moveTo(x * 25, 40);
          ctx.lineTo(x * 25, 160);
          ctx.stroke();
          
          // Hour labels
          ctx.fillStyle = '#6c757d';
          ctx.font = '11px "Segoe UI", Roboto, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${x}:00`, x * 25 + 12.5, 30);
        }

        // Status labels
        ctx.textAlign = 'left';
        ctx.font = '12px "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#495057';
        ctx.fillText('Off-Duty', 10, 150);
        ctx.fillText('On-Duty', 10, 110);
        ctx.fillText('Driving', 10, 70);

        // Draw status lines
        ctx.beginPath();
        let x = 0;
        log.status_log.forEach(([time, status]) => {
          const hour = new Date(time).getHours();
          x = hour * 25 + 12.5; // Center in the hour column
          const y = status === 'Driving' ? 60 : status === 'On-Duty' ? 100 : 140;
          ctx.lineTo(x, y);
        });
        
        // Line style
        ctx.strokeStyle = '#4e73df';
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Add dots at status change points
        log.status_log.forEach(([time, status]) => {
          const hour = new Date(time).getHours();
          x = hour * 25 + 12.5;
          const y = status === 'Driving' ? 60 : status === 'On-Duty' ? 100 : 140;
          
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#4e73df';
          ctx.fill();
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 1;
          ctx.stroke();
        });

        // Draw info box with shadow
        ctx.shadowColor = 'rgba(0,0,0,0.1)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillStyle = 'white';
        ctx.strokeStyle = '#e9ecef';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(150, 50, 200, 80, 8);
        ctx.fill();
        ctx.stroke();
        ctx.shadowColor = 'transparent';

        // Info text
        ctx.font = 'bold 14px "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#4e73df';
        ctx.fillText(`Date: ${log.date}`, 160, 70);
        
        ctx.font = '12px "Segoe UI", Roboto, sans-serif';
        ctx.fillStyle = '#495057';
        ctx.fillText(`Driving: ${log.driving_hours}h`, 160, 90);
        ctx.fillText(`On-Duty: ${log.on_duty_hours}h`, 160, 110);
        ctx.fillText(`Fueling Stops: ${log.fueling_stops}`, 160, 130);
      }
    });
  }, [logs]);

  return (
    <div className="mt-5" style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="text-center mb-5">
        <h2 className="h3 mb-3" style={{ 
          color: '#2c3e50',
          fontWeight: '600',
          position: 'relative',
          display: 'inline-block'
        }}>
          Daily Log Sheets
          <span style={{
            position: 'absolute',
            bottom: '-8px',
            left: '0',
            width: '100%',
            height: '3px',
            background: 'linear-gradient(90deg, #4e73df, #2ecc71)',
            borderRadius: '3px'
          }}></span>
        </h2>
        
        <div className="d-flex justify-content-center align-items-center mt-4">
          <div className="legend-item me-4">
            <span className="legend-color" style={{ 
              backgroundColor: '#4e73df',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              display: 'inline-block',
              marginRight: '6px'
            }}></span>
            <span className="legend-label" style={{ color: '#495057' }}>Driving</span>
          </div>
          <div className="legend-item me-4">
            <span className="legend-color" style={{ 
              backgroundColor: '#4e73df',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              display: 'inline-block',
              marginRight: '6px'
            }}></span>
            <span className="legend-label" style={{ color: '#495057' }}>On-Duty</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ 
              backgroundColor: '#4e73df',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              display: 'inline-block',
              marginRight: '6px'
            }}></span>
            <span className="legend-label" style={{ color: '#495057' }}>Off-Duty</span>
          </div>
        </div>
      </div>

      {logs.map((log, index) => (
        <div key={index} className="card shadow-lg mb-5 fade-in" style={{ 
          border: 'none',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <div className="card-body p-4">
            <canvas
              ref={(el) => (canvasRefs.current[index] = el)}
              width={650}
              height={180}
              style={{ 
                width: '100%',
                height: 'auto',
                maxWidth: '650px',
                borderRadius: '8px'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LogSheet;