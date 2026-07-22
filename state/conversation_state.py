from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class RecipientInfo(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None

class SenderInfo(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

class CartItem(BaseModel):
    product_id: str
    product_name: str
    price: float
    quantity: int = 1

class DeliveryDetails(BaseModel):
    city: Optional[str] = None
    requested_date: Optional[str] = None
    is_available: Optional[bool] = None
    delivery_fee: Optional[float] = None
    estimated_delivery: Optional[str] = None

class ShoppingIntent(BaseModel):
    intent_type: str = "GENERAL"  # PRODUCT_SEARCH, DELIVERY_CHECK, RECOMMENDATION, CHECKOUT, TRACK_ORDER, MIXED_QUERY, GENERAL
    category: Optional[str] = None
    keywords: Optional[str] = None
    budget_max: Optional[float] = None
    occasion: Optional[str] = None
    recipient_relation: Optional[str] = None
    delivery_date: Optional[str] = None

class StepExecution(BaseModel):
    step_id: int
    agent_name: str
    action: str
    status: str = "completed"  # pending | running | completed | failed
    output: Optional[Dict[str, Any]] = None

class ExecutionPlan(BaseModel):
    steps: List[StepExecution] = []
    current_step_index: int = 0
    is_completed: bool = False

class ThoughtStep(BaseModel):
    agent: str
    detail: str
    timestamp: str

class SwarmState(BaseModel):
    session_id: str = "default_session"
    user_query: str = ""
    intent: ShoppingIntent = Field(default_factory=ShoppingIntent)
    cart: List[CartItem] = []
    recipient: RecipientInfo = Field(default_factory=RecipientInfo)
    sender: SenderInfo = Field(default_factory=SenderInfo)
    delivery: DeliveryDetails = Field(default_factory=DeliveryDetails)
    gift_message: Optional[str] = None
    search_results: List[Dict[str, Any]] = []
    selected_product: Optional[Dict[str, Any]] = None
    tracking_info: Optional[Dict[str, Any]] = None
    order_result: Optional[Dict[str, Any]] = None
    validation_errors: List[str] = []
    thought_process: List[ThoughtStep] = []
    plan: ExecutionPlan = Field(default_factory=ExecutionPlan)
    final_response: Optional[str] = None
