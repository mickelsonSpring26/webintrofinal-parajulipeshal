using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin()));
var app = builder.Build();
app.UseCors();
app.UseStaticFiles();

string filePath = "crops.json";
List<Crop> LoadCrops()
{
    if (!File.Exists(filePath))
        return new List<Crop>();

    var json = File.ReadAllText(filePath);

    if (string.IsNullOrWhiteSpace(json))  //This will be helpful when i manually clean crop.json file. It won't crash due to empty...
        return new List<Crop>();

    return JsonSerializer.Deserialize<List<Crop>>(json);

    // return null;
}
void SaveCrops(List<Crop> crops)
{

    var json = JsonSerializer.Serialize(crops);
    File.WriteAllText(filePath, json);
    // return null;
}
var crops = LoadCrops();



app.MapGet("/", () => "Hello World!");

app.MapPost("/crops", (Crop crop) =>
{
    crop.Id = crops.Count + 1;
    crops.Add(crop);
    SaveCrops(crops);
    return Results.Ok(crop);
});

app.MapGet("/crops/{userName}", (string userName) =>
{
    return Results.Ok(crops.Where(c => c.UserName == userName).ToList());
});
app.MapGet("/crops/{userName}/filter", (string userName, string cropName, string quantity) =>
{
    var query = crops.Where(c => c.UserName == userName);

    query = query.Where(c => c.CropType.Contains(cropName, StringComparison.OrdinalIgnoreCase));

    if (int.TryParse(quantity, out var quantityValue))
    {
        query = query.Where(c => int.TryParse(c.Quantity, out var cropQuantity) && cropQuantity >= quantityValue);
    }
    else
    {
        query = query.Where(c => c.Quantity.Contains(quantity, StringComparison.OrdinalIgnoreCase));
    }

    return Results.Ok(query.ToList());
});

app.MapDelete("/crops/{id}", (int id) =>
{  //I found that we use MapDelete to accept the delete request from out service.js file
    var crop = crops.FirstOrDefault(c => c.Id == id);
    crops.Remove(crop!);
    SaveCrops(crops);
    return Results.Ok(crop);
});

app.Run();

class Crop
{
    public int Id { get; set; }
    public string UserName { get; set; }
    public string CropType { get; set; }
    public string PlantingDate { get; set; }
    public string FieldLocation { get; set; }
    public string Quantity { get; set; }
    public string Picture { get; set; }
    public int? WateringFrequencyDays { get; set; }
}
