import React, { useEffect, useState } from "react";
import { X, User, Building, Mail, MapPin, Truck, Calendar, FileText, Loader2 } from "lucide-react";
import { fetchOrderById } from "../services/mockApi";

export function DetailDrawer({ detailId, onClose }) {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!detailId) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetchOrderById(detailId)
      .then(res => {
        if (isMounted) {
          setOrder(res);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [detailId]);

  // Handle Escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!detailId) return null;

  return (
    <div className="drawer-overlay" onClick={onClose} role="presentation">
      <div 
        className="drawer-panel custom-scrollbar" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Header */}
        <div className="drawer-header">
          <div>
            <h2 id="drawer-title" className="drawer-title font-mono text-cyan">{detailId}</h2>
            <span className="drawer-subtitle">Order Detail View (Deep-Linked)</span>
          </div>
          <button 
            type="button" 
            className="btn-close" 
            onClick={onClose}
            aria-label="Close detail drawer (Escape)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="drawer-loading" aria-busy="true">
            <Loader2 size={32} className="spinner-icon text-cyan" />
            <p className="text-cyan">Loading order {detailId} details...</p>
          </div>
        ) : error ? (
          <div className="drawer-error" role="alert">
            <p className="text-rose">{error}</p>
            <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
          </div>
        ) : order ? (
          <div className="drawer-content-box">
            {/* Amount & Status Banner */}
            <div className="drawer-card banner-card">
              <div>
                <span className="text-muted label-sm">Order Total</span>
                <div className="amount-hero font-mono">${order.amount.toFixed(2)}</div>
              </div>
              <div>
                <span className={`status-pill status-${order.status}`}>{order.status}</span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="drawer-card">
              <h3 className="card-title"><User size={15} /> Customer Information</h3>
              <div className="info-grid">
                <div className="info-row">
                  <span className="text-muted">Name:</span>
                  <strong>{order.customer.name}</strong>
                </div>
                <div className="info-row">
                  <span className="text-muted"><Building size={13} /> Company:</span>
                  <span>{order.customer.company}</span>
                </div>
                <div className="info-row">
                  <span className="text-muted"><Mail size={13} /> Email:</span>
                  <span>{order.customer.email}</span>
                </div>
              </div>
            </div>

            {/* Logistics & Shipping */}
            <div className="drawer-card">
              <h3 className="card-title"><Truck size={15} /> Shipping & Fulfillment</h3>
              <div className="info-grid">
                <div className="info-row">
                  <span className="text-muted">Tracking ID:</span>
                  <span className="font-mono text-cyan">{order.trackingNumber}</span>
                </div>
                <div className="info-row">
                  <span className="text-muted"><MapPin size={13} /> Destination:</span>
                  <span>{order.city}</span>
                </div>
                <div className="info-row">
                  <span className="text-muted"><Calendar size={13} /> Placed On:</span>
                  <span>{new Date(order.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Order Notes */}
            <div className="drawer-card">
              <h3 className="card-title"><FileText size={15} /> Internal Notes</h3>
              <p className="notes-text text-muted">{order.notes}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
