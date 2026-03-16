import { BarChart2, Download, ArrowRight, ArrowLeft } from 'lucide-react';

export default function NetMovementModal({ data, onClose }) {
  if (!data) return null;

  const net = (data.purchases || 0) + (data.transferIn || 0) - (data.transferOut || 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title"><BarChart2 size={24} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} /> Net Movement Breakdown</h2>

        <div className="modal-grid">
          <div className="modal-stat">
            <div className="modal-stat-value" style={{ '--stat-color': '#10b981' }}>
              {data.purchases ?? 0}
            </div>
            <div className="modal-stat-label"><Download size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Purchases</div>
          </div>
          <div className="modal-stat">
            <div className="modal-stat-value" style={{ '--stat-color': '#3b82f6' }}>
              {data.transferIn ?? 0}
            </div>
            <div className="modal-stat-label"><ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Transfer In</div>
          </div>
          <div className="modal-stat">
            <div className="modal-stat-value" style={{ '--stat-color': '#ef4444' }}>
              {data.transferOut ?? 0}
            </div>
            <div className="modal-stat-label"><ArrowLeft size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Transfer Out</div>
          </div>
        </div>

        <div className="modal-formula">
          Net = {data.purchases ?? 0} + {data.transferIn ?? 0} − {data.transferOut ?? 0} = <strong style={{ color: 'var(--accent-light)' }}>{net}</strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
