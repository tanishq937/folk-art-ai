
import numpy as np
from PIL import Image
from torchvision import transforms
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
from pytorch_grad_cam.utils.image import show_cam_on_image

gradcam_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

def generate_gradcam(img_path, model, target_layer, device):
    img = Image.open(img_path).convert("RGB")
    img_resized = img.resize((224, 224))
    rgb_img = np.array(img_resized).astype(np.float32) / 255.0

    input_tensor = gradcam_transform(img).unsqueeze(0).to(device)

    cam = GradCAM(model=model, target_layers=[target_layer])
    pred_idx = model(input_tensor).argmax(dim=1).item()
    grayscale_cam = cam(input_tensor=input_tensor, targets=[ClassifierOutputTarget(pred_idx)])[0]

    visualization = show_cam_on_image(rgb_img, grayscale_cam, use_rgb=True)
    return pred_idx, visualization
