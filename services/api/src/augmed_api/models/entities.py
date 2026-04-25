from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from augmed_api.models.base import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    full_name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    role: Mapped[str] = mapped_column(String(50))
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))


class Case(Base, TimestampMixin):
    __tablename__ = "cases"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    patient_reference: Mapped[str | None] = mapped_column(String(120), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="uploaded")
    modality: Mapped[str] = mapped_column(String(20), default="CXR")
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    uploaded_images: Mapped[list["UploadedImage"]] = relationship(
        back_populates="case",
        cascade="all, delete-orphan",
        order_by="UploadedImage.created_at",
    )
    predictions: Mapped[list["Prediction"]] = relationship(
        back_populates="case",
        cascade="all, delete-orphan",
        order_by="Prediction.created_at",
    )
    reviews: Mapped[list["ExpertReview"]] = relationship(
        back_populates="case",
        cascade="all, delete-orphan",
        order_by="ExpertReview.reviewed_at",
    )
    reports: Mapped[list["Report"]] = relationship(
        back_populates="case",
        cascade="all, delete-orphan",
        order_by="Report.generated_at",
    )
    enhanced_images: Mapped[list["EnhancedImage"]] = relationship(
        back_populates="case",
        cascade="all, delete-orphan",
        order_by="EnhancedImage.created_at",
    )
    heatmaps: Mapped[list["ExplanationHeatmap"]] = relationship(
        back_populates="case",
        cascade="all, delete-orphan",
        order_by="ExplanationHeatmap.created_at",
    )


class UploadedImage(Base):
    __tablename__ = "uploaded_images"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    case_id: Mapped[str] = mapped_column(ForeignKey("cases.id", ondelete="CASCADE"))
    original_filename: Mapped[str] = mapped_column(String(255))
    storage_path: Mapped[str] = mapped_column(String(500))
    content_type: Mapped[str] = mapped_column(String(100))
    size_bytes: Mapped[int] = mapped_column(Integer)
    width: Mapped[int | None] = mapped_column(Integer, nullable=True)
    height: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    case: Mapped[Case] = relationship(back_populates="uploaded_images")


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    case_id: Mapped[str] = mapped_column(ForeignKey("cases.id", ondelete="CASCADE"))
    label: Mapped[str] = mapped_column(String(80))
    confidence: Mapped[float] = mapped_column(Float)
    model_name: Mapped[str] = mapped_column(String(120))
    model_version: Mapped[str] = mapped_column(String(80))
    status: Mapped[str] = mapped_column(String(50), default="completed")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    case: Mapped[Case] = relationship(back_populates="predictions")


class ExpertReview(Base):
    __tablename__ = "expert_reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    case_id: Mapped[str] = mapped_column(ForeignKey("cases.id", ondelete="CASCADE"))
    reviewer_name: Mapped[str] = mapped_column(String(120))
    decision: Mapped[str] = mapped_column(String(50))
    corrected_label: Mapped[str | None] = mapped_column(String(80), nullable=True)
    comments: Mapped[str | None] = mapped_column(Text, nullable=True)
    reviewed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    case: Mapped[Case] = relationship(back_populates="reviews")


class EnhancedImage(Base):
    __tablename__ = "enhanced_images"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    case_id: Mapped[str] = mapped_column(ForeignKey("cases.id", ondelete="CASCADE"))
    storage_path: Mapped[str] = mapped_column(String(500))
    technique: Mapped[str] = mapped_column(String(80), default="clahe+median")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    case: Mapped[Case] = relationship(back_populates="enhanced_images")


class ExplanationHeatmap(Base):
    __tablename__ = "explanation_heatmaps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    case_id: Mapped[str] = mapped_column(ForeignKey("cases.id", ondelete="CASCADE"))
    storage_path: Mapped[str] = mapped_column(String(500))
    method: Mapped[str] = mapped_column(String(80), default="grad-cam-demo")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    case: Mapped[Case] = relationship(back_populates="heatmaps")


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    case_id: Mapped[str] = mapped_column(ForeignKey("cases.id", ondelete="CASCADE"))
    status: Mapped[str] = mapped_column(String(50), default="pending_generation")
    path: Mapped[str] = mapped_column(String(500))
    generated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    case: Mapped[Case] = relationship(back_populates="reports")
